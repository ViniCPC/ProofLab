export interface Vote {
  id: string
  approve: boolean
  voterWallet: string
  milestoneId: string
  createdAt: string
}

export interface VoteSummary {
  total: number
  approved: number
  rejected: number
}

export interface MilestoneVoteResult {
  votes: Vote[]
  summary: VoteSummary
}

export interface VoteMilestonePayload {
  approve: boolean
}
