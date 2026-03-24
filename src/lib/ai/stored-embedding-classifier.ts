import { getEmbedding } from '../embeddings';
import { cosineSimilarity } from '../utils';
import { categoryEmbeddingStore } from './embedding-store';

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
  query: string
): Promise<StoredEmbeddingClassification | null> {
  const records = await categoryEmbeddingStore.getAll();

  if (records.length === 0) {
    return null;
  }

  const queryEmbedding = await getEmbedding(query);
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
