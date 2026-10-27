import { api } from './api'
import type { MilestoneVoteResult } from '@/types/voting'

export const votingService = {
  getByMilestone: (projectId: string, milestoneId: string) =>
    api.get<MilestoneVoteResult>(
      `/research/${projectId}/milestones/${milestoneId}/votes`,
    ),
}
