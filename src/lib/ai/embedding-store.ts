import prisma from '../prisma';

export type EmbeddingSourceType = 'CATEGORY' | 'EXAMPLE';

export interface StoredCategoryEmbedding {
  id: string;
  categoryKey: string;
  categoryName: string;
  sourceType: EmbeddingSourceType;
  sourceText: string;
  embedding: number[];
}

export interface NewCategoryEmbedding {
  categoryKey: string;
  categoryName: string;
  sourceType: EmbeddingSourceType;
  sourceText: string;
  embedding: number[];
}

export function embeddingRecordKey(record: {
  categoryKey: string;
  sourceType: EmbeddingSourceType;
  sourceText: string;
}): string {
  return `${record.categoryKey}|${record.sourceType}|${record.sourceText}`;
}

export interface CategoryEmbeddingStore {
  /**
   * Upserts embeddings by unique key (categoryKey, sourceType, sourceText).
   * Safe for large catalogs because it does not delete existing data.
   */
  upsertMany(records: NewCategoryEmbedding[]): Promise<void>;

  /**
   * Legacy API; prefer upsertMany.
   * Note: current implementation is equivalent to upsertMany (no delete).
   */
  replaceAll(records: NewCategoryEmbedding[]): Promise<void>;

  /**
   * Returns keys for all stored rows (no vectors). Used to skip re-embedding
   * existing catalog entries during incremental syncs.
   */
  getExistingKeys(): Promise<Set<string>>;

  getAll(): Promise<StoredCategoryEmbedding[]>;
}

/**
 * Prisma-backed store using float arrays today.
 * Keep classifier logic store-agnostic so this can be swapped to pgvector later.
 */
export class PrismaCategoryEmbeddingStore implements CategoryEmbeddingStore {
  async upsertMany(records: NewCategoryEmbedding[]): Promise<void> {
    if (records.length === 0) return;

    await prisma.$transaction(
      records.map((record) =>
        prisma.aiCategoryEmbedding.upsert({
          where: {
            categoryKey_sourceType_sourceText: {
              categoryKey: record.categoryKey,
              sourceType: record.sourceType,
              sourceText: record.sourceText,
            },
          },
          create: {
            categoryKey: record.categoryKey,
            categoryName: record.categoryName,
            sourceType: record.sourceType,
            sourceText: record.sourceText,
            embedding: record.embedding,
          },
          update: {
            categoryName: record.categoryName,
            embedding: record.embedding,
          },
        })
      )
    );
  }

  async replaceAll(records: NewCategoryEmbedding[]): Promise<void> {
    // For safety with large catalogs, we no longer delete everything.
    // This preserves existing embeddings if a sync is interrupted.
    await this.upsertMany(records);
  }

  async getExistingKeys(): Promise<Set<string>> {
    const rows = await prisma.aiCategoryEmbedding.findMany({
      select: {
        categoryKey: true,
        sourceType: true,
        sourceText: true,
      },
    });

    return new Set(rows.map((row) => embeddingRecordKey(row)));
  }

  async getAll(): Promise<StoredCategoryEmbedding[]> {
    const records = await prisma.$queryRaw<StoredCategoryEmbedding[]>`
      SELECT
        "id",
        "categoryKey",
        "categoryName",
        "sourceType"::text as "sourceType",
        "sourceText",
        "embedding"
      FROM "AiCategoryEmbedding"
    `;

    return records.map((record) => ({
      id: record.id,
      categoryKey: record.categoryKey,
      categoryName: record.categoryName,
      sourceType: record.sourceType,
      sourceText: record.sourceText,
      embedding: record.embedding,
    }));
  }
}

export const categoryEmbeddingStore: CategoryEmbeddingStore =
  new PrismaCategoryEmbeddingStore();
