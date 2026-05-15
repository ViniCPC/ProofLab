import { api } from './api'
import type {
  ContributionResponse,
  ContributePayload,
  FundingStats,
} from '@/types/contribution'

export const contributionService = {
  findByProject: (projectId: string) =>
    api.get<FundingStats>(`/research/${projectId}/contributions`),

  contribute: (projectId: string, payload: ContributePayload) =>
    api.post<ContributionResponse>(
      `/research/${projectId}/contribute`,
      payload,
    ),
}
