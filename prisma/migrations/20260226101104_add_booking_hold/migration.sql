/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Availability` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Availability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'HOLD';

-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_serviceId_fkey";

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "serviceId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "startTime" SET DATA TYPE TIME(0),
ALTER COLUMN "endTime" SET DATA TYPE TIME(0);

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "holdExpiresAt" TIMESTAMP(3),
ADD COLUMN     "providerResponseDeadline" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Availability_providerId_dayOfWeek_idx" ON "Availability"("providerId", "dayOfWeek");
