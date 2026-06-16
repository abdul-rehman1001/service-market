import { getEmbedding } from '../embeddings';
import { cosineSimilarity } from '../utils';
import {
  categoryEmbeddingStore,
  type StoredCategoryEmbedding,
} from './embedding-store';

// ---------------------------------------------------------------------------
// In-memory cache for stored embeddings.
// The table can hold tens of thousands of vectors; fetching it from the DB on
// every classify request is slow and is a major cause of production timeouts.
// ---------------------------------------------------------------------------
const RECORDS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

let cachedRecords: StoredCategoryEmbedding[] | null = null;
let cacheExpiry = 0;
let inFlightFetch: Promise<StoredCategoryEmbedding[]> | null = null;

async function getCachedRecords(): Promise<StoredCategoryEmbedding[]> {
  const now = Date.now();
  if (cachedRecords && now < cacheExpiry) return cachedRecords;

  // Deduplicate concurrent fetches of the (large) embeddings table.
  if (!inFlightFetch) {
    inFlightFetch = categoryEmbeddingStore
      .getAll()
      .then((records) => {
        cachedRecords = records;
        cacheExpiry = Date.now() + RECORDS_CACHE_TTL;
        return records;
      })
      .finally(() => {
        inFlightFetch = null;
      });
  }

  try {
    return await inFlightFetch;
  } catch (err) {
    // If the refresh fails but we still hold stale data, serve it rather
    // than failing the whole classification.
    if (cachedRecords) {
      console.error('Embedding records refresh failed; serving stale cache:', err);
      return cachedRecords;
    }
    throw err;
  }
}

export type StoredCategoryMatch = {
  category: string;
  categoryName: string;
  similarity: number;
};

export type StoredEmbeddingClassification = {
  category: string;
  categoryName: string;
  confidence: number;
  allMatches: StoredCategoryMatch[];
};

export async function classifyWithStoredEmbeddings(
  query: string,
  precomputedQueryEmbedding?: number[]
): Promise<StoredEmbeddingClassification | null> {
  const records = await getCachedRecords();

  if (records.length === 0) {
    return null;
  }

  const queryEmbedding = precomputedQueryEmbedding ?? (await getEmbedding(query));
  const categoryBestScore: Record<string, StoredCategoryMatch> = {};

  for (const record of records) {
    const similarity = cosineSimilarity(queryEmbedding, record.embedding);
    const existing = categoryBestScore[record.categoryKey];

    if (!existing || similarity > existing.similarity) {
      categoryBestScore[record.categoryKey] = {
        category: record.categoryKey,
        categoryName: record.categoryName,
        similarity,
      };
    }
  }

  const allMatches = Object.values(categoryBestScore).sort(
    (a, b) => b.similarity - a.similarity
  );

  if (allMatches.length === 0) {
    return null;
  }

  const best = allMatches[0];

  return {
    category: best.category,
    categoryName: best.categoryName,
    confidence: best.similarity,
    allMatches: allMatches.slice(0, 5),
  };
}
