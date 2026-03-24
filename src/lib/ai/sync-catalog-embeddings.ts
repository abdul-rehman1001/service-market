import { getEmbedding } from '../embeddings';
import { aiCategories } from '../training-data';
import {
  categoryEmbeddingStore,
  type NewCategoryEmbedding,
} from './embedding-store';

export type CatalogSyncSummary = {
  totalCategories: number;
  totalExampleQueries: number;
  totalEmbeddingsStored: number;
};

export async function syncCatalogEmbeddings(): Promise<CatalogSyncSummary> {
  const records: NewCategoryEmbedding[] = [];

  for (const category of aiCategories) {
    const categoryEmbedding = await getEmbedding(category.name);
    records.push({
      categoryKey: category.key,
      categoryName: category.name,
      sourceType: 'CATEGORY',
      sourceText: category.name,
      embedding: categoryEmbedding,
    });

    const exampleEmbeddings = await Promise.all(
      category.examples.map(async (query) => ({
        categoryKey: category.key,
        categoryName: category.name,
        sourceType: 'EXAMPLE' as const,
        sourceText: query,
        embedding: await getEmbedding(query),
      }))
    );

    records.push(...exampleEmbeddings);
  }

  await categoryEmbeddingStore.replaceAll(records);

  return {
    totalCategories: aiCategories.length,
    totalExampleQueries: aiCategories.reduce(
      (sum, category) => sum + category.examples.length,
      0
    ),
    totalEmbeddingsStored: records.length,
  };
}
