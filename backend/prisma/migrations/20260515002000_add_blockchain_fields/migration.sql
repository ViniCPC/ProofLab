-- AlterTable: ResearchProject — blockchain fields (Sprint 7)
ALTER TABLE "ResearchProject"
  ADD COLUMN "onChainProjectNonce"   BIGINT,
  ADD COLUMN "onChainProjectAddress" TEXT,
  ADD COLUMN "escrowVaultAddress"    TEXT,
  ADD COLUMN "onChainStatus"         TEXT;

-- AlterTable: Milestone — blockchain fields (Sprint 7)
ALTER TABLE "Milestone"
  ADD COLUMN "onChainMilestoneAddress" TEXT,
  ADD COLUMN "releaseTransactionHash"  TEXT;

-- AlterTable: Contribution — blockchain fields (Sprint 7)
ALTER TABLE "Contribution"
  ADD COLUMN "transactionHash"            TEXT,
  ADD COLUMN "onChainContributionAddress" TEXT;
