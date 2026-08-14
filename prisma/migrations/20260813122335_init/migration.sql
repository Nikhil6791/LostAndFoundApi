-- CreateEnum
CREATE TYPE "LostStatus" AS ENUM ('ACTIVE', 'RETURNED');

-- CreateEnum
CREATE TYPE "FoundStatus" AS ENUM ('PENDING', 'AVAILABLE', 'RETURNED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostItem" (
    "id" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "locationLost" TEXT NOT NULL,
    "dateLost" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "status" "LostStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LostItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoundItem" (
    "id" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "locationFound" TEXT NOT NULL,
    "dateFound" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "status" "FoundStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoundItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "foundItemId" TEXT NOT NULL,
    "claimantName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "proof" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "LostItem_status_idx" ON "LostItem"("status");

-- CreateIndex
CREATE INDEX "LostItem_category_idx" ON "LostItem"("category");

-- CreateIndex
CREATE INDEX "LostItem_dateLost_idx" ON "LostItem"("dateLost");

-- CreateIndex
CREATE INDEX "FoundItem_status_idx" ON "FoundItem"("status");

-- CreateIndex
CREATE INDEX "FoundItem_category_idx" ON "FoundItem"("category");

-- CreateIndex
CREATE INDEX "FoundItem_dateFound_idx" ON "FoundItem"("dateFound");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_foundItemId_idx" ON "Claim"("foundItemId");

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES "FoundItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
