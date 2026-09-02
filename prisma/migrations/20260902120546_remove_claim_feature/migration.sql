-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_foundItemId_fkey";

-- DropTable
DROP TABLE "Claim";

-- DropEnum
DROP TYPE "ClaimStatus";

