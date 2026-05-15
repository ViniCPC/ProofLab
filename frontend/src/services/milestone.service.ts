import { api } from './api'
import type {
  CreateMilestonePayload,
  Milestone,
  SubmitMilestoneReviewPayload,
} from '@/types/milestone'

export const milestoneService = {
  create: (projectId: string, payload: CreateMilestonePayload) =>
    api.post<Milestone>(`/research/${projectId}/milestones`, payload),

  findByProject: (projectId: string) =>
    api.get<Milestone[]>(`/research/${projectId}/milestones`),

  submitReview: (
    projectId: string,
    milestoneId: string,
    payload: SubmitMilestoneReviewPayload,
  ) =>
    api.post<Milestone>(
      `/research/${projectId}/milestones/${milestoneId}/submit-review`,
      payload,
    ),
}
