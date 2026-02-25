-- DropIndex
DROP INDEX "Availability_providerId_serviceId_dayOfWeek_key";

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "images" SET DEFAULT ARRAY[]::TEXT[];
