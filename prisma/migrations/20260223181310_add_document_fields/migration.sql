/*
  Warnings:

  - Added the required column `documentType` to the `ProviderDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `ProviderDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `ProviderDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `ProviderDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProviderDocument` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CNIC_FRONT', 'CNIC_BACK', 'CERTIFICATE', 'OTHER');

-- AlterTable
ALTER TABLE "ProviderDocument" ADD COLUMN     "documentType" "DocumentType" NOT NULL,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
