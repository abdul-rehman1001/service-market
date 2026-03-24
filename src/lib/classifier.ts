
import { getEmbedding } from './embeddings';
import { trainingData, categoryKeywords, aiCategories } from './training-data';
import { cosineSimilarity } from './utils';
import prisma from './prisma';
import { classifyWithStoredEmbeddings } from './ai/stored-embedding-classifier';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ClassificationResult {
  category: string;          // AI-detected category key (e.g. "plumber")
  categoryId: string | null; // Matching DB category ID
  categoryName: string;      // DB category name or formatted key
  confidence: number;
  allMatches: Array<{
    category: string;
    categoryId: string | null;
    categoryName: string;
    similarity: number;
  }>;
}

// ---------------------------------------------------------------------------
// Embedding Cache – computed once, reused for all queries
// ---------------------------------------------------------------------------
interface CachedCategory {
  key: string;
  embedding: number[];
}

let embeddingCache: CachedCategory[] | null = null;
let cachePromise: Promise<CachedCategory[]> | null = null;

async function getEmbeddingCache(): Promise<CachedCategory[]> {
  if (embeddingCache) return embeddingCache;

  // Prevent concurrent initialisation
  if (cachePromise) return cachePromise;

  cachePromise = buildCache();
  embeddingCache = await cachePromise;
  cachePromise = null;
  return embeddingCache;
}

async function buildCache(): Promise<CachedCategory[]> {
  const items: CachedCategory[] = [];

  // Compute embeddings for every training example, grouped by category
  for (const [categoryKey, examples] of Object.entries(trainingData)) {
    const embeddings = await Promise.all(examples.map((ex) => getEmbedding(ex)));
    for (const embedding of embeddings) {
      items.push({ key: categoryKey, embedding });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// DB category ID cache – maps category key → DB category ID(s)
// ---------------------------------------------------------------------------
interface DbCategoryMapping {
  id: string;
  name: string;
  parentId: string | null;
}

let dbCategoryMap: Record<string, DbCategoryMapping[]> | null = null;
let dbMapExpiry = 0;
const DB_MAP_TTL = 5 * 60 * 1000; // refresh every 5 min

async function getDbCategoryMap(): Promise<Record<string, DbCategoryMapping[]>> {
  const now = Date.now();
  if (dbCategoryMap && now < dbMapExpiry) return dbCategoryMap;

  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    select: { id: true, name: true, parentId: true },
  });

  const map: Record<string, DbCategoryMapping[]> = {};

  for (const [key, keywords] of Object.entries(categoryKeywords)) {
    const matched = categories.filter((cat) =>
      keywords.some((kw) => cat.name.toLowerCase().includes(kw.toLowerCase()))
    );
    if (matched.length > 0) {
      map[key] = matched.map((c) => ({ id: c.id, name: c.name, parentId: c.parentId }));
    }
  }

  dbCategoryMap = map;
  dbMapExpiry = now + DB_MAP_TTL;
  return map;
}

// ---------------------------------------------------------------------------
// Fast keyword matching – avoids embedding computation for obvious queries
// ---------------------------------------------------------------------------
function keywordMatch(query: string): { key: string; score: number } | null {
  const lower = query.toLowerCase();

  let best: { key: string; score: number } | null = null;

  for (const [key, keywords] of Object.entries(categoryKeywords)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        // Longer keyword match = higher confidence
        const score = kw.length / lower.length;
        const adjusted = Math.min(0.95, 0.7 + score * 0.3);
        if (!best || adjusted > best.score) {
          best = { key, score: adjusted };
        }
      }
    }
  }

  return best;
}

// ---------------------------------------------------------------------------
// Main classification function
// ---------------------------------------------------------------------------
export async function classifyQuery(query: string): Promise<ClassificationResult> {
  const dbMap = await getDbCategoryMap();

  // 1. Try fast keyword match first
  const kwMatch = keywordMatch(query);
  if (kwMatch && kwMatch.score >= 0.75) {
    const dbEntry = dbMap[kwMatch.key]?.[0];
    const allMatches = buildAllMatchesFromKeywords(query, dbMap);
    return {
      category: kwMatch.key,
      categoryId: dbEntry?.id ?? null,
      categoryName: dbEntry?.name ?? formatKey(kwMatch.key),
      confidence: kwMatch.score,
      allMatches,
    };
  }

  // 2. Fall back to embedding similarity
  const dbBackedResult = await classifyWithStoredEmbeddings(query);
  if (dbBackedResult) {
    const allMatches = dbBackedResult.allMatches.map((match) => {
      const dbEntry = dbMap[match.category]?.[0];
      return {
        category: match.category,
        categoryId: dbEntry?.id ?? null,
        categoryName: dbEntry?.name ?? match.categoryName,
        similarity: match.similarity,
      };
    });

    const best = allMatches[0];

    return {
      category: best.category,
      categoryId: best.categoryId,
      categoryName: best.categoryName,
      confidence: best.similarity,
      allMatches,
    };
  }

  // 3. Fall back to in-memory training data similarity if DB embeddings are missing
  const [queryEmbedding, cache] = await Promise.all([
    getEmbedding(query),
    getEmbeddingCache(),
  ]);

  // Aggregate best similarity per category (take max similarity per category)
  const categoryScores: Record<string, number> = {};

  for (const item of cache) {
    const sim = cosineSimilarity(queryEmbedding, item.embedding);
    if (!categoryScores[item.key] || sim > categoryScores[item.key]) {
      categoryScores[item.key] = sim;
    }
  }

  // Sort categories by score descending
  const sorted = Object.entries(categoryScores)
    .map(([key, similarity]) => {
      const dbEntry = dbMap[key]?.[0];
      return {
        category: key,
        categoryId: dbEntry?.id ?? null,
        categoryName: dbEntry?.name ?? formatKey(key),
        similarity,
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

  const best = sorted[0];

  return {
    category: best.category,
    categoryId: best.categoryId,
    categoryName: best.categoryName,
    confidence: best.similarity,
    allMatches: sorted.slice(0, 5),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatKey(key: string): string {
  const catalogName = aiCategories.find((category) => category.key === key)?.name;
  if (catalogName) return catalogName;

  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildAllMatchesFromKeywords(
  query: string,
  dbMap: Record<string, DbCategoryMapping[]>
): ClassificationResult['allMatches'] {
  const lower = query.toLowerCase();
  const results: ClassificationResult['allMatches'] = [];

  for (const [key, keywords] of Object.entries(categoryKeywords)) {
    let maxScore = 0;
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        const score = kw.length / lower.length;
        const adjusted = Math.min(0.95, 0.7 + score * 0.3);
        maxScore = Math.max(maxScore, adjusted);
      }
    }
    if (maxScore > 0) {
      const dbEntry = dbMap[key]?.[0];
      results.push({
        category: key,
        categoryId: dbEntry?.id ?? null,
        categoryName: dbEntry?.name ?? formatKey(key),
        similarity: maxScore,
      });
    }
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, 5);
}
