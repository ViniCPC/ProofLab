import type { RiskLevel } from './ai'
import type { PaginationMeta } from './api'
import type { Milestone, CreateMilestonePayload } from './milestone'
import type { UserSummary } from './user'

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED'
export type OnChainStatus = 'Funding' | 'Active' | 'Completed' | 'Cancelled'

export interface ResearchProject {
  id: string
  title: string
  description: string
  totalAmount: string
  status: ProjectStatus
  onChainStatus: OnChainStatus | null
  onChainProjectAddress: string | null
  escrowVaultAddress: string | null
  aiSummary: string | null
  innovationScore: number | null
  feasibilityScore: number | null
  riskLevel: RiskLevel | null
  complexityLevel: RiskLevel | null
  creatorId: string
  creator?: UserSummary
  createdAt: string
  updatedAt: string
  milestones?: Milestone[]
}

export interface CreateResearchPayload {
  title: string
  description: string
  totalAmount: string
  milestones?: CreateMilestonePayload[]
}

export interface ResearchListResponse {
  data: ResearchProject[]
  meta: PaginationMeta
}
