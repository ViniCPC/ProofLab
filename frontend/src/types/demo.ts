import type { MilestoneStatus } from './milestone'
import type { OnChainStatus, ProjectStatus } from './research'
import type { UserSummary } from './user'

export type DemoScenario =
  | 'baseline'
  | 'funding'
  | 'pending-review'
  | 'approved'
  | 'cancelled'
  | 'completed'

export interface DemoMilestoneSummary {
  id: string
  title: string
  order: number
  status: MilestoneStatus
}

export interface DemoContributionSummary {
  id: string
  amount: string
  wallet: string
}

export interface DemoProjectSummary {
  id: string
  title: string
  description: string
  totalAmount: string
  status: ProjectStatus
  onChainStatus: OnChainStatus | null
  creator: UserSummary
  milestones: DemoMilestoneSummary[]
  contributions: DemoContributionSummary[]
}

export interface DemoSummary {
  primaryProjectId: string
  pendingReviewMilestoneId: string
  projects: DemoProjectSummary[]
}
