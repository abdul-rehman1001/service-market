-- CreateEnum
CREATE TYPE "EmbeddingSourceType" AS ENUM ('CATEGORY', 'EXAMPLE');

-- CreateTable
CREATE TABLE "AiCategoryEmbedding" (
    "id" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "sourceType" "EmbeddingSourceType" NOT NULL,
    "sourceText" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiCategoryEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiCategoryEmbedding_categoryKey_idx" ON "AiCategoryEmbedding"("categoryKey");

-- CreateIndex
CREATE UNIQUE INDEX "AiCategoryEmbedding_categoryKey_sourceType_sourceText_key"
ON "AiCategoryEmbedding"("categoryKey", "sourceType", "sourceText");
