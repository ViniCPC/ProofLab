import type { PaginationMeta } from './api'
import type { UserSummary } from './user'

export interface Contribution {
  id: string
  amount: string
  wallet: string
  projectId: string
  onChainContributionAddress: string | null
  createdAt: string
  funder: UserSummary
}

export interface FundingStats {
  projectId: string
  totalRaised: string
  totalAmount: string
  fundingPercentage: number
  investors: Contribution[]
  meta: PaginationMeta
}

export interface ContributePayload {
  amount: string
}

export interface ContributionResponse {
  funding: FundingStats
  contribution: Contribution
}
