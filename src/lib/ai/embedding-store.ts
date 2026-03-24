import prisma from '../prisma';
import crypto from 'crypto';

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

export interface CategoryEmbeddingStore {
  replaceAll(records: NewCategoryEmbedding[]): Promise<void>;
  getAll(): Promise<StoredCategoryEmbedding[]>;
}

/**
 * Prisma-backed store using float arrays today.
 * Keep classifier logic store-agnostic so this can be swapped to pgvector later.
 */
export class PrismaCategoryEmbeddingStore implements CategoryEmbeddingStore {
  async replaceAll(records: NewCategoryEmbedding[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`DELETE FROM "AiCategoryEmbedding"`;

      if (records.length > 0) {
        for (const record of records) {
          await tx.$executeRaw`
            INSERT INTO "AiCategoryEmbedding"
              ("id", "categoryKey", "categoryName", "sourceType", "sourceText", "embedding", "createdAt", "updatedAt")
            VALUES
              (
                ${crypto.randomUUID()},
                ${record.categoryKey},
                ${record.categoryName},
                ${record.sourceType}::"EmbeddingSourceType",
                ${record.sourceText},
                ${record.embedding},
                NOW(),
                NOW()
              )
          `;
        }
      }
    });
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
