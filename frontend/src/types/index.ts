export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED'
export type MilestoneStatus = 'PENDING' | 'PENDING_REVIEW' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
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
  createdAt: string
  updatedAt: string
  milestones?: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  amount: string
  order: number
  status: MilestoneStatus
  onChainMilestoneAddress: string | null
  aiSummary: string | null
  consistencyScore: number | null
  completionEstimate: number | null
  aiRiskLevel: RiskLevel | null
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface Contribution {
  id: string
  amount: string
  wallet: string
  projectId: string
  onChainContributionAddress: string | null
  createdAt: string
  funder: {
    id: string
    name: string
    walletAddress: string
  }
}

export interface Vote {
  id: string
  approve: boolean
  voterWallet: string
  milestoneId: string
  createdAt: string
}

export interface FundingStats {
  projectId: string
  totalRaised: string
  totalAmount: string
  fundingPercentage: number
  investors: Contribution[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiError {
  statusCode: number
  message: string
}
