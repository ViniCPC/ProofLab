-- CreateEnum
CREATE TYPE "AiAnalysisStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "aiRecommendation" TEXT,
ADD COLUMN     "aiStatus" "AiAnalysisStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "ResearchProject" ADD COLUMN     "aiRecommendation" TEXT,
ADD COLUMN     "aiStatus" "AiAnalysisStatus" NOT NULL DEFAULT 'PENDING';
