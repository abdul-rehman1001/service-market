/*
  Warnings:

  - Made the column `baseAddress` on table `ServiceProvider` required. This step will fail if there are existing NULL values in that column.
  - Made the column `latitude` on table `ServiceProvider` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `ServiceProvider` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `latitude` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `address` on table `User` required. This step will fail if there are existing NULL values in that column.

*/

-- Step 1: Set default values for existing NULL ServiceProvider records
-- Using Lahore, Pakistan as default location (74.3587° E, 31.5204° N)
UPDATE "ServiceProvider" 
SET "baseAddress" = 'Lahore, Pakistan'
WHERE "baseAddress" IS NULL;

UPDATE "ServiceProvider" 
SET "longitude" = 74.3587, "latitude" = 31.5204
WHERE "longitude" IS NULL OR "latitude" IS NULL;

-- Step 2: Add new columns to User table with default values first
ALTER TABLE "User" ADD COLUMN "latitude" DECIMAL(10,7);
ALTER TABLE "User" ADD COLUMN "longitude" DECIMAL(10,7);

-- Step 3: Set default values for existing NULL User records
UPDATE "User" 
SET "address" = 'Lahore, Pakistan'
WHERE "address" IS NULL;

UPDATE "User" 
SET "longitude" = 74.3587, "latitude" = 31.5204
WHERE "longitude" IS NULL OR "latitude" IS NULL;

-- Step 4: Make columns NOT NULL after setting defaults
ALTER TABLE "ServiceProvider" 
ALTER COLUMN "baseAddress" SET NOT NULL,
ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;

ALTER TABLE "User" 
ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL;

