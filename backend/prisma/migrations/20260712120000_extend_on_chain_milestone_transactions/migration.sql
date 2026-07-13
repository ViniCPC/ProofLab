-- Extend pending on-chain transactions to cover milestone, vote and release flows.

ALTER TYPE "OnChainOperation" ADD VALUE IF NOT EXISTS 'CREATE_MILESTONE';
ALTER TYPE "OnChainOperation" ADD VALUE IF NOT EXISTS 'SUBMIT_MILESTONE';
ALTER TYPE "OnChainOperation" ADD VALUE IF NOT EXISTS 'VOTE_MILESTONE';
ALTER TYPE "OnChainOperation" ADD VALUE IF NOT EXISTS 'FINALIZE_VOTE';
ALTER TYPE "OnChainOperation" ADD VALUE IF NOT EXISTS 'RELEASE_FUNDS';

ALTER TABLE "OnChainTransaction"
  ADD COLUMN IF NOT EXISTS "milestoneId" TEXT,
  ADD COLUMN IF NOT EXISTS "expectedMilestoneAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "expectedVoteAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "metadata" JSONB;

CREATE INDEX IF NOT EXISTS "OnChainTransaction_milestoneId_status_idx"
  ON "OnChainTransaction"("milestoneId", "status");

ALTER TABLE "OnChainTransaction"
  ADD CONSTRAINT "OnChainTransaction_milestoneId_fkey"
  FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
