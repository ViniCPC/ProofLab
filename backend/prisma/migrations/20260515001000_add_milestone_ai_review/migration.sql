-- AlterEnum
ALTER TYPE "MilestoneStatus" ADD VALUE 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "Milestone"
ADD COLUMN "aiSummary" TEXT,
ADD COLUMN "consistencyScore" INTEGER,
ADD COLUMN "completionEstimate" INTEGER,
ADD COLUMN "aiRiskLevel" TEXT,
ADD COLUMN "submittedReport" TEXT,
ADD COLUMN "submittedAt" TIMESTAMP(3);
