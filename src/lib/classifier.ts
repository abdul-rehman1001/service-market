
import { getEmbedding, warmUpEmbedder } from './embeddings';
import { trainingData, categoryKeywords, aiCategories } from './training-data';
import { cosineSimilarity } from './utils';
import prisma from './prisma';
import { classifyWithStoredEmbeddings } from './ai/stored-embedding-classifier';
import { getOutOfScopeScore } from './ai/out-of-scope';

// ---------------------------------------------------------------------------
// Tuning
// ---------------------------------------------------------------------------
/**
 * Minimum embedding similarity for a result to count as a real match.
 * Below this we report "no match" so the UI can show "no results found"
 * instead of a confidently-wrong category.
 */
const MIN_MATCH_CONFIDENCE = 0.45;

/**
 * Keyword matches below this threshold do NOT short-circuit the pipeline;
 * embeddings still run and the higher of the two confidence scores is used.
 *
 * The keyword formula tops out at ~0.95 for a one-word query (e.g. "plumber"),
 * but for natural-language queries like "my sink pipe is leaking" it only
 * reaches ~0.75 because the matched keyword ("pipe", 4 chars) is short
 * relative to the full query. Setting this threshold to 0.88 means those
 * borderline keyword hits fall through to the embedding path, which has been
 * trained with rich conversational examples and regularly scores 85 %+.
 * Very short, unambiguous queries (e.g. bare keyword "plumber", "puncture")
 * still score above 0.88 and skip the slower embedding step.
 */
const KEYWORD_SHORT_CIRCUIT_THRESHOLD = 0.88;

/**
 * Max time the embedding pipeline may take before we fall back to keyword
 * matching. Keeps the API responsive even while a cold serverless instance
 * is still downloading the model.
 */
const EMBEDDING_TIME_BUDGET_MS = 20_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ClassificationResult {
  matched: boolean;          // false => nothing relevant found ("no results")
  category: string | null;   // AI-detected category key (e.g. "plumber")
  categoryId: string | null; // Matching DB category ID
  categoryName: string | null; // DB category name or formatted key
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

function normalizeCategoryName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Maps AI category keys → active DB categories.
 *
 * Primary: exact match on ai-categories.json `name` ↔ ServiceCategory.name
 * (e.g. car_ac_technician → "AC Technician (Automotive)").
 *
 * Fallback: keyword match for keys without an exact name hit. Keyword-only
 * matches exclude DB rows already claimed by another key's exact name.
 */
async function getDbCategoryMap(): Promise<Record<string, DbCategoryMapping[]>> {
  const now = Date.now();
  if (dbCategoryMap && now < dbMapExpiry) return dbCategoryMap;

  let categories: Array<{ id: string; name: string; parentId: string | null }>;
  try {
    categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true, parentId: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  } catch (err) {
    // DB hiccup: serve the stale map instead of failing the whole request.
    if (dbCategoryMap) {
      console.error('Category map refresh failed; serving stale map:', err);
      return dbCategoryMap;
    }
    throw err;
  }

  const dbByNormName = new Map(
    categories.map((c) => [normalizeCategoryName(c.name), c] as const)
  );

  const map: Record<string, DbCategoryMapping[]> = {};
  const claimedDbIds = new Set<string>();

  // 1. Exact catalog name → DB row (most reliable; fixes car AC mapping).
  for (const aiCat of aiCategories) {
    const dbCat = dbByNormName.get(normalizeCategoryName(aiCat.name));
    if (!dbCat) continue;
    map[aiCat.key] = [
      { id: dbCat.id, name: dbCat.name, parentId: dbCat.parentId },
    ];
    claimedDbIds.add(dbCat.id);
  }

  // 2. Keyword fallback for any key still unmapped.
  for (const [key, keywords] of Object.entries(categoryKeywords)) {
    if (map[key]?.length) continue;

    const catalogName = aiCategories.find((c) => c.key === key)?.name;
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    const matched = categories
      .filter((cat) => {
        if (claimedDbIds.has(cat.id)) return false;
        const normName = normalizeCategoryName(cat.name);
        return sortedKeywords.some((kw) =>
          normName.includes(kw.toLowerCase())
        );
      })
      .sort((a, b) => {
        // Prefer the DB name closest to the catalog display name.
        if (catalogName) {
          const aExact =
            normalizeCategoryName(a.name) === normalizeCategoryName(catalogName)
              ? 1
              : 0;
          const bExact =
            normalizeCategoryName(b.name) === normalizeCategoryName(catalogName)
              ? 1
              : 0;
          if (bExact !== aExact) return bExact - aExact;
        }
        return a.name.length - b.name.length;
      });

    if (matched.length > 0) {
      map[key] = matched.map((c) => ({
        id: c.id,
        name: c.name,
        parentId: c.parentId,
      }));
      for (const c of matched) claimedDbIds.add(c.id);
    }
  }

  dbCategoryMap = map;
  dbMapExpiry = now + DB_MAP_TTL;
  return map;
}

// ---------------------------------------------------------------------------
// Fast keyword matching – avoids embedding computation for obvious queries
// ---------------------------------------------------------------------------
const keywordRegexCache = new Map<string, RegExp>();

/**
 * Whole-word keyword test. Plain `includes` causes false positives with
 * short keywords, e.g. "ac" matching inside "facing" or "package".
 */
function containsKeyword(lowerQuery: string, keyword: string): boolean {
  let regex = keywordRegexCache.get(keyword);
  if (!regex) {
    const escaped = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    regex = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`);
    keywordRegexCache.set(keyword, regex);
  }
  return regex.test(lowerQuery);
}

function keywordMatch(query: string): { key: string; score: number } | null {
  const lower = query.toLowerCase();

  let best: { key: string; score: number } | null = null;

  for (const [key, keywords] of Object.entries(categoryKeywords)) {
    for (const kw of keywords) {
      if (containsKeyword(lower, kw)) {
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
  // Start loading the embedding model immediately so a cold instance is warm
  // by the time (this or a later) request needs embeddings.
  warmUpEmbedder();

  const dbMap = await getDbCategoryMap();

  // 1. Try fast keyword match first
  const kwMatch = keywordMatch(query);
  if (kwMatch && kwMatch.score >= KEYWORD_SHORT_CIRCUIT_THRESHOLD) {
    const dbEntry = dbMap[kwMatch.key]?.[0];
    const allMatches = buildAllMatchesFromKeywords(query, dbMap);
    return {
      matched: true,
      category: kwMatch.key,
      categoryId: dbEntry?.id ?? null,
      categoryName: dbEntry?.name ?? formatKey(kwMatch.key),
      confidence: kwMatch.score,
      allMatches,
    };
  }

  // 2. Embedding similarity (DB-backed store first, in-memory fallback).
  // Never let an embedding failure bubble up as a 500: degrade to keyword
  // matching / "no match" instead.
  try {
    const embeddingOutcome = await withTimeout(
      classifyWithEmbeddings(query, dbMap),
      EMBEDDING_TIME_BUDGET_MS,
      'Embedding classification timed out'
    );

    if (embeddingOutcome) {
      const { result, outOfScopeScore } = embeddingOutcome;

      // The query resembles a service we explicitly do NOT offer (e.g. sofa
      // cleaning) more than any real category → genuine no-match.
      if (outOfScopeScore >= result.confidence) {
        return {
          matched: false,
          category: null,
          categoryId: null,
          categoryName: null,
          confidence: result.confidence,
          allMatches: [],
        };
      }

      if (result.confidence >= MIN_MATCH_CONFIDENCE) {
        return result;
      }

      // Embeddings are unsure (common for Roman Urdu / slang); a keyword hit,
      // even a weak one, is a stronger signal than a low-similarity embedding.
      if (kwMatch) {
        const dbEntry = dbMap[kwMatch.key]?.[0];
        return {
          matched: true,
          category: kwMatch.key,
          categoryId: dbEntry?.id ?? null,
          categoryName: dbEntry?.name ?? formatKey(kwMatch.key),
          confidence: kwMatch.score,
          allMatches: buildAllMatchesFromKeywords(query, dbMap),
        };
      }

      // Embeddings worked but nothing was similar enough → genuine no-match.
      return {
        ...result,
        matched: false,
        allMatches: result.allMatches.filter(
          (m) => m.similarity >= MIN_MATCH_CONFIDENCE
        ),
      };
    }
  } catch (err) {
    console.error('Embedding classification failed, using keyword fallback:', err);
  }

  // 3. Degraded fallback: accept any keyword hit, even a weak one.
  if (kwMatch) {
    const dbEntry = dbMap[kwMatch.key]?.[0];
    return {
      matched: true,
      category: kwMatch.key,
      categoryId: dbEntry?.id ?? null,
      categoryName: dbEntry?.name ?? formatKey(kwMatch.key),
      confidence: kwMatch.score,
      allMatches: buildAllMatchesFromKeywords(query, dbMap),
    };
  }

  // 4. Nothing usable found.
  return {
    matched: false,
    category: null,
    categoryId: null,
    categoryName: null,
    confidence: 0,
    allMatches: [],
  };
}

interface EmbeddingOutcome {
  result: ClassificationResult;
  /** Best similarity against known out-of-scope service examples. */
  outOfScopeScore: number;
}

async function classifyWithEmbeddings(
  query: string,
  dbMap: Record<string, DbCategoryMapping[]>
): Promise<EmbeddingOutcome | null> {
  // Compute the query embedding once and reuse it for category matching and
  // the out-of-scope guard.
  const queryEmbedding = await getEmbedding(query);

  const [dbBackedResult, outOfScopeScore] = await Promise.all([
    classifyWithStoredEmbeddings(query, queryEmbedding),
    getOutOfScopeScore(queryEmbedding),
  ]);

  // Preferred: pre-computed embeddings stored in the database.
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
      outOfScopeScore,
      result: {
        matched: true,
        category: best.category,
        categoryId: best.categoryId,
        categoryName: best.categoryName,
        confidence: best.similarity,
        allMatches,
      },
    };
  }

  // Fallback: compute embeddings for the bundled training data (only used
  // when the DB embedding store is empty).
  const cache = await getEmbeddingCache();

  // Aggregate best similarity per category (take max similarity per category)
  const categoryScores: Record<string, number> = {};

  for (const item of cache) {
    const sim = cosineSimilarity(queryEmbedding, item.embedding);
    if (!categoryScores[item.key] || sim > categoryScores[item.key]) {
      categoryScores[item.key] = sim;
    }
  }

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

  if (sorted.length === 0) return null;

  const best = sorted[0];

  return {
    outOfScopeScore,
    result: {
      matched: true,
      category: best.category,
      categoryId: best.categoryId,
      categoryName: best.categoryName,
      confidence: best.similarity,
      allMatches: sorted.slice(0, 5),
    },
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
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
      if (containsKeyword(lower, kw)) {
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
