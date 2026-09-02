-- AlterTable
ALTER TABLE "FoundItem" ADD COLUMN     "trackingId" TEXT;

-- AlterTable
ALTER TABLE "LostItem" ADD COLUMN     "trackingId" TEXT;

-- CreateTable
CREATE TABLE "TrackingCounter" (
    "year" INTEGER NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TrackingCounter_pkey" PRIMARY KEY ("year")
);

-- CreateIndex
CREATE UNIQUE INDEX "FoundItem_trackingId_key" ON "FoundItem"("trackingId");

-- CreateIndex
CREATE UNIQUE INDEX "LostItem_trackingId_key" ON "LostItem"("trackingId");

