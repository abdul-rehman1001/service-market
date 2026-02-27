-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "baseAddress" TEXT,
ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "longitude" DECIMAL(10,7);
