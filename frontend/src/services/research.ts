import { api } from './api'
import type { FundingStats, Milestone, ResearchProject } from '@/types'

export interface CreateResearchPayload {
  title: string
  description: string
  totalAmount: string
  milestones?: { title: string; description: string; amount: string; order: number }[]
}

export const researchService = {
  list: (page = 1, limit = 10) =>
    api.get<{ data: ResearchProject[]; meta: object }>(
      `/research?page=${page}&limit=${limit}`,
    ),

  getById: (id: string) => api.get<ResearchProject>(`/research/${id}`),

  create: (payload: CreateResearchPayload) =>
    api.post<ResearchProject>('/research', payload),

  getMilestones: (id: string) =>
    api.get<Milestone[]>(`/research/${id}/milestones`),

  getContributions: (id: string) =>
    api.get<FundingStats>(`/research/${id}/contributions`),

  createOnChain: (id: string) =>
    api.post<{ transaction: string; onChainProjectAddress: string }>(
      `/research/${id}/create-on-chain`,
      {},
    ),

  fundOnChain: (id: string, amount: number) =>
    api.post<{ transaction: string }>(`/research/${id}/fund-on-chain`, { amount }),

  claimRefund: (id: string) =>
    api.post<{ transaction: string }>(`/research/${id}/claim-refund`, {}),
}

export const milestoneService = {
  submitOnChain: (projectId: string, milestoneId: string, votingDurationSeconds: number) =>
    api.post<{ transaction: string; onChainMilestoneAddress: string }>(
      `/research/${projectId}/milestones/${milestoneId}/submit-on-chain`,
      { votingDurationSeconds },
    ),

  voteOnChain: (projectId: string, milestoneId: string, approve: boolean) =>
    api.post<{ transaction: string }>(
      `/research/${projectId}/milestones/${milestoneId}/vote-on-chain`,
      { approve },
    ),

  releaseOnChain: (projectId: string, milestoneId: string) =>
    api.post<{ transaction: string }>(
      `/research/${projectId}/milestones/${milestoneId}/release-on-chain`,
      {},
    ),
}
