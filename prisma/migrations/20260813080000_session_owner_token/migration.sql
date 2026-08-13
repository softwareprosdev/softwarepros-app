-- AlterTable
ALTER TABLE "DiscoverySession" ADD COLUMN     "ownerToken" TEXT;

-- CreateIndex
CREATE INDEX "DiscoverySession_ownerToken_updatedAt_idx" ON "DiscoverySession"("ownerToken", "updatedAt");
