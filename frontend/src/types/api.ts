export interface ApiError {
  statusCode: number
  message: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TransactionResponse {
  transaction: string
}

export interface PreparedTransactionResponse extends TransactionResponse {
  requestId: string
}

export interface ConfirmTransactionResponse {
  status: 'PENDING' | 'CONFIRMED'
  operation?: string
  signature: string
  onChainProjectAddress?: string
  escrowVaultAddress?: string
  onChainContributionAddress?: string
  onChainMilestoneAddress?: string
  onChainVoteAddress?: string
}
