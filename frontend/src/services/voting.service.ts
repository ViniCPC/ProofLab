import { api } from './api'
import type {
  MilestoneVoteResult,
  Vote,
  VoteMilestonePayload,
} from '@/types/voting'

export const votingService = {
  getByMilestone: (projectId: string, milestoneId: string) =>
    api.get<MilestoneVoteResult>(
      `/research/${projectId}/milestones/${milestoneId}/votes`,
    ),

  vote: (
    projectId: string,
    milestoneId: string,
    payload: VoteMilestonePayload,
  ) =>
    api.post<Vote>(
      `/research/${projectId}/milestones/${milestoneId}/votes`,
      payload,
    ),
}
