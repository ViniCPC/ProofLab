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
  /** Sum (USDC) of the contributions of wallets that approved. */
  approvedWeight: string
  /** Sum (USDC) of the contributions of wallets that rejected. */
  rejectedWeight: string
  /** ISO date after which the vote can be closed; null when unknown. */
  votingEndsAt: string | null
}

export interface MilestoneVoteResult {
  votes: Vote[]
  summary: VoteSummary
}
