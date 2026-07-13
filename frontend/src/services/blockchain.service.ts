import { api } from './api'
import type {
  ConfirmTransactionResponse,
  PreparedTransactionResponse,
} from '@/types/api'

interface CreateProjectOnChainResponse extends PreparedTransactionResponse {
  onChainProjectAddress: string
  escrowVaultAddress: string
}

interface FundProjectOnChainResponse extends PreparedTransactionResponse {
  onChainContributionAddress: string
}

interface SubmitMilestoneOnChainResponse extends PreparedTransactionResponse {
  onChainMilestoneAddress: string
}

interface VoteMilestoneOnChainResponse extends PreparedTransactionResponse {
  onChainVoteAddress: string
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
    api.post<PreparedTransactionResponse>(
      `/research/${projectId}/cancel-on-chain`,
      {},
    ),

  claimRefund: (projectId: string) =>
    api.post<PreparedTransactionResponse>(
      `/research/${projectId}/claim-refund`,
      {},
    ),

  confirmTransaction: (
    projectId: string,
    requestId: string,
    signature: string,
  ) =>
    api.post<ConfirmTransactionResponse>(
      `/research/${projectId}/on-chain/confirm-transaction`,
      { requestId, signature },
    ),

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
    api.post<VoteMilestoneOnChainResponse>(
      `/research/${projectId}/milestones/${milestoneId}/vote-on-chain`,
      { approve },
    ),

  finalizeMilestoneVote: (projectId: string, milestoneId: string) =>
    api.post<PreparedTransactionResponse>(
      `/research/${projectId}/milestones/${milestoneId}/finalize-vote-on-chain`,
      {},
    ),

  releaseFunds: (projectId: string, milestoneId: string) =>
    api.post<PreparedTransactionResponse>(
      `/research/${projectId}/milestones/${milestoneId}/release-on-chain`,
      {},
    ),
}
