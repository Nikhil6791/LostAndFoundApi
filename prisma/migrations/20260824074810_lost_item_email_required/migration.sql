/*
  Warnings:

  - Made the column `email` on table `LostItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LostItem" ALTER COLUMN "email" SET NOT NULL;
