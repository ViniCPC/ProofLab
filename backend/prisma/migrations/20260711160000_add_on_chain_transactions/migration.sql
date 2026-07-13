-- CreateEnum
CREATE TYPE "OnChainOperation" AS ENUM (
  'CREATE_PROJECT',
  'FUND_PROJECT',
  'CANCEL_PROJECT',
  'CLAIM_REFUND'
);

-- CreateEnum
CREATE TYPE "OnChainTransactionStatus" AS ENUM (
  'PENDING_SIGNATURE',
  'SUBMITTED',
  'CONFIRMED',
  'FAILED'
);

-- CreateTable
CREATE TABLE "OnChainTransaction" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "wallet" TEXT NOT NULL,
  "operation" "OnChainOperation" NOT NULL,
  "status" "OnChainTransactionStatus" NOT NULL DEFAULT 'PENDING_SIGNATURE',
  "signature" TEXT,
  "amount" DECIMAL(18,6),
  "nonce" BIGINT,
  "expectedProjectAddress" TEXT,
  "expectedEscrowVaultAddress" TEXT,
  "expectedContributionAddress" TEXT,
  "slot" BIGINT,
  "confirmationStatus" TEXT,
  "logs" JSONB,
  "errorMessage" TEXT,
  "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OnChainTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnChainTransaction_signature_key" ON "OnChainTransaction"("signature");

-- CreateIndex
CREATE INDEX "OnChainTransaction_projectId_status_idx" ON "OnChainTransaction"("projectId", "status");

-- CreateIndex
CREATE INDEX "OnChainTransaction_userId_status_idx" ON "OnChainTransaction"("userId", "status");

-- CreateIndex
CREATE INDEX "OnChainTransaction_operation_status_idx" ON "OnChainTransaction"("operation", "status");

-- AddForeignKey
ALTER TABLE "OnChainTransaction"
  ADD CONSTRAINT "OnChainTransaction_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnChainTransaction"
  ADD CONSTRAINT "OnChainTransaction_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
