import { api } from './api'
import type { TransactionResponse } from '@/types/api'

interface CreateProjectOnChainResponse extends TransactionResponse {
  onChainProjectAddress: string
  escrowVaultAddress: string
}

interface FundProjectOnChainResponse extends TransactionResponse {
  onChainContributionAddress: string
}

interface SubmitMilestoneOnChainResponse extends TransactionResponse {
  onChainMilestoneAddress: string
}

export const blockchainService = {
  createProjectOnChain: (projectId: string) =>
    api.post<CreateProjectOnChainResponse>(
      `/research/${projectId}/create-on-chain`,
      {},
    ),

  fundProjectOnChain: (projectId: string, amount: number) =>
    api.post<FundProjectOnChainResponse>(`/research/${projectId}/fund-on-chain`, {
      amount,
    }),

  cancelProjectOnChain: (projectId: string) =>
    api.post<TransactionResponse>(`/research/${projectId}/cancel-on-chain`, {}),

  claimRefund: (projectId: string) =>
    api.post<TransactionResponse>(`/research/${projectId}/claim-refund`, {}),

  createMilestoneOnChain: (projectId: string, milestoneId: string) =>
    api.post<SubmitMilestoneOnChainResponse>(
      `/research/${projectId}/milestones/${milestoneId}/create-on-chain`,
      {},
    ),

  submitMilestoneOnChain: (
    projectId: string,
    milestoneId: string,
    votingDurationSeconds: number,
  ) =>
    api.post<SubmitMilestoneOnChainResponse>(
      `/research/${projectId}/milestones/${milestoneId}/submit-on-chain`,
      { votingDurationSeconds },
    ),

  voteMilestoneOnChain: (
    projectId: string,
    milestoneId: string,
    approve: boolean,
  ) =>
    api.post<TransactionResponse>(
      `/research/${projectId}/milestones/${milestoneId}/vote-on-chain`,
      { approve },
    ),

  finalizeMilestoneVote: (projectId: string, milestoneId: string) =>
    api.post<TransactionResponse>(
      `/research/${projectId}/milestones/${milestoneId}/finalize-vote-on-chain`,
      {},
    ),

  releaseFunds: (projectId: string, milestoneId: string) =>
    api.post<TransactionResponse>(
      `/research/${projectId}/milestones/${milestoneId}/release-on-chain`,
      {},
    ),
}
