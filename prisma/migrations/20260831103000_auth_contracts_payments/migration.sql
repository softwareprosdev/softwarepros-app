-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('PENDING_REVIEW', 'SENT', 'SIGNED', 'VOID');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "DiscoverySession" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "ProjectSummary" ADD COLUMN     "estimatedLowCents" INTEGER,
ADD COLUMN     "estimatedHighCents" INTEGER,
ADD COLUMN     "estimateNotes" TEXT;

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "summaryId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "scopeText" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "bodyHash" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "totalCents" INTEGER NOT NULL,
    "depositCents" INTEGER NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "signedAt" TIMESTAMP(3),
    "signerName" TEXT,
    "signerIp" TEXT,
    "signerUserAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscoverySession_userId_updatedAt_idx" ON "DiscoverySession"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_publicId_key" ON "Contract"("publicId");

-- CreateIndex
CREATE INDEX "Contract_userId_idx" ON "Contract"("userId");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeSessionId_key" ON "Payment"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Payment_contractId_idx" ON "Payment"("contractId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DiscoverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "ProjectSummary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
