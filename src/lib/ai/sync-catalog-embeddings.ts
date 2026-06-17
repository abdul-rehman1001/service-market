import { getEmbedding } from '../embeddings';
import { aiCategories, aiCategoryQueries } from '../training-data';
import {
  categoryEmbeddingStore,
  embeddingRecordKey,
  type NewCategoryEmbedding,
} from './embedding-store';

export type CatalogSyncOptions = {
  /**
   * When true, skip rows that already exist in AiCategoryEmbedding (by unique key).
   * Only new/changed sourceText entries are embedded and upserted.
   */
  onlyNew?: boolean;
  /**
   * When true, skip the large labeled `data` array in ai-categories.json.
   * Use when you only added examples under categories[].examples.
   */
  skipLabeledData?: boolean;
};

export type CatalogSyncSummary = {
  totalCategories: number;
  totalExampleQueries: number;
  totalEmbeddingsStored: number;
  totalSkipped: number;
};

export async function syncCatalogEmbeddings(
  options: CatalogSyncOptions = {}
): Promise<CatalogSyncSummary> {
  const onlyNew = options.onlyNew ?? false;
  const skipLabeledData = options.skipLabeledData ?? false;
  const dbBatchSize = Number.parseInt(
    process.env.AI_EMBED_DB_BATCH_SIZE ?? '100',
    10
  );
  const embeddingConcurrency = Number.parseInt(
    process.env.AI_EMBED_CONCURRENCY ?? '2',
    10
  );

  if (!Number.isFinite(dbBatchSize) || dbBatchSize <= 0) {
    throw new Error('AI_EMBED_DB_BATCH_SIZE must be a positive number');
  }
  if (!Number.isFinite(embeddingConcurrency) || embeddingConcurrency <= 0) {
    throw new Error('AI_EMBED_CONCURRENCY must be a positive number');
  }

  let pending: NewCategoryEmbedding[] = [];
  let totalEmbeddingsStored = 0;
  let totalSkipped = 0;
  let totalExampleQueries = 0;
  let processedCategories = 0;

  const seen = new Set<string>();
  const existingKeys = onlyNew
    ? await categoryEmbeddingStore.getExistingKeys()
    : new Set<string>();

  if (onlyNew) {
    console.log(
      `Incremental sync: ${existingKeys.size} embeddings already in DB will be skipped.`
    );
  }
  if (skipLabeledData) {
    console.log('Skipping labeled data array (categories[].examples only).');
  }

  async function flush(): Promise<void> {
    if (pending.length === 0) return;
    await categoryEmbeddingStore.upsertMany(pending);
    totalEmbeddingsStored += pending.length;
    pending = [];

    if (totalEmbeddingsStored % 500 === 0) {
      console.log(
        `Stored/updated ${totalEmbeddingsStored} embeddings (categories processed: ${processedCategories}/${aiCategories.length})`
      );
    }
  }

  function pushRecord(record: NewCategoryEmbedding): void {
    const key = embeddingRecordKey(record);
    if (seen.has(key)) return;
    seen.add(key);
    pending.push(record);
  }

  function isAlreadyStored(record: {
    categoryKey: string;
    sourceType: NewCategoryEmbedding['sourceType'];
    sourceText: string;
  }): boolean {
    if (!onlyNew) return false;
    return existingKeys.has(embeddingRecordKey(record));
  }

  const categoryNameByKey = new Map(
    aiCategories
      .filter((c) => typeof c?.key === 'string' && typeof c?.name === 'string')
      .map((c) => [c.key, c.name] as const)
  );

  for (const category of aiCategories) {
    processedCategories += 1;

    const categoryKey = typeof category.key === 'string' ? category.key.trim() : '';
    const categoryName = category.name?.trim();
    if (!categoryKey) continue;
    if (!categoryName) continue;

    if (isAlreadyStored({ categoryKey, sourceType: 'CATEGORY', sourceText: categoryName })) {
      totalSkipped += 1;
    } else {
      pushRecord({
        categoryKey: category.key,
        categoryName,
        sourceType: 'CATEGORY',
        sourceText: categoryName,
        embedding: await getEmbedding(categoryName),
      });
    }

    if (pending.length >= dbBatchSize) await flush();

    const examples = Array.isArray(category.examples) ? category.examples : [];
    totalExampleQueries += examples.length;

    for (let i = 0; i < examples.length; i += embeddingConcurrency) {
      const chunk = examples
        .slice(i, i + embeddingConcurrency)
        .map((q) => (typeof q === 'string' ? q.trim() : ''))
        .filter(Boolean);

      if (chunk.length === 0) continue;

      const toEmbed = chunk.filter(
        (query) =>
          !isAlreadyStored({
            categoryKey,
            sourceType: 'EXAMPLE',
            sourceText: query,
          })
      );
      totalSkipped += chunk.length - toEmbed.length;

      if (toEmbed.length === 0) continue;

      const chunkEmbeddings = await Promise.all(
        toEmbed.map(async (query) => ({
          query,
          embedding: await getEmbedding(query),
        }))
      );

      for (const { query, embedding } of chunkEmbeddings) {
        pushRecord({
          categoryKey: category.key,
          categoryName,
          sourceType: 'EXAMPLE',
          sourceText: query,
          embedding,
        });
      }

      if (pending.length >= dbBatchSize) await flush();
    }
  }

  // Additional labeled queries (e.g., 25k rows) stored under ai-categories.json:data
  if (!skipLabeledData && aiCategoryQueries.length > 0) {
    console.log(`Embedding labeled dataset queries: ${aiCategoryQueries.length}`);
  }

  for (let i = 0; i < aiCategoryQueries.length; i += embeddingConcurrency) {
    const chunk = aiCategoryQueries.slice(i, i + embeddingConcurrency);

    const normalized = chunk
      .map((row) => {
        const query = typeof row?.query === 'string' ? row.query.trim() : '';
        const categoryKey =
          typeof row?.category_key === 'string' ? row.category_key.trim() : '';
        const categoryName =
          (typeof row?.category_name === 'string' ? row.category_name.trim() : '') ||
          (categoryKey ? categoryNameByKey.get(categoryKey) : undefined) ||
          '';

        return {
          query,
          categoryKey,
          categoryName,
        };
      })
      .filter((row) => row.query && row.categoryKey && row.categoryName);

    if (normalized.length === 0) continue;
    totalExampleQueries += normalized.length;

    const toEmbed = normalized.filter(
      (row) =>
        !isAlreadyStored({
          categoryKey: row.categoryKey,
          sourceType: 'EXAMPLE',
          sourceText: row.query,
        })
    );
    totalSkipped += normalized.length - toEmbed.length;

    if (toEmbed.length === 0) continue;

    const chunkEmbeddings = await Promise.all(
      toEmbed.map(async (row) => ({
        row,
        embedding: await getEmbedding(row.query),
      }))
    );

    for (const { row, embedding } of chunkEmbeddings) {
      pushRecord({
        categoryKey: row.categoryKey,
        categoryName: row.categoryName,
        sourceType: 'EXAMPLE',
        sourceText: row.query,
        embedding,
      });
    }

    if (pending.length >= dbBatchSize) await flush();

    const processed = Math.min(i + embeddingConcurrency, aiCategoryQueries.length);
    if (processed % 1000 === 0) {
      console.log(
        `Embedded ${processed}/${aiCategoryQueries.length} labeled queries (stored so far: ${totalEmbeddingsStored + pending.length})`
      );
    }
  }

  await flush();

  return {
    totalCategories: aiCategories.length,
    totalExampleQueries,
    totalEmbeddingsStored,
    totalSkipped,
  };
}
