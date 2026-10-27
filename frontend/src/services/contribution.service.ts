import { api } from './api'
import type { FundingStats } from '@/types/contribution'

export const contributionService = {
  findByProject: (projectId: string) =>
    api.get<FundingStats>(`/research/${projectId}/contributions`),
}
