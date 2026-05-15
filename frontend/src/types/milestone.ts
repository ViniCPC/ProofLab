import type { RiskLevel } from './ai'

export type MilestoneStatus =
  | 'PENDING'
  | 'PENDING_REVIEW'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'

export interface Milestone {
  id: string
  title: string
  description: string
  amount: string
  order: number
  status: MilestoneStatus
  onChainMilestoneAddress: string | null
  releaseTransactionHash: string | null
  aiSummary: string | null
  consistencyScore: number | null
  completionEstimate: number | null
  aiRiskLevel: RiskLevel | null
  submittedReport: string | null
  submittedAt: string | null
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface CreateMilestonePayload {
  title: string
  description: string
  amount: string
  order: number
}

export interface SubmitMilestoneReviewPayload {
  submittedReport: string
  progress: number
  evidenceText: string
}
