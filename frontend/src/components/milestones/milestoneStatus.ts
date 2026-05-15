import type { Milestone } from '@/types'

export type MilestoneDisplayStatus =
  | 'LOCKED'
  | 'CURRENT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'

function previousMilestonesApproved(
  milestone: Milestone,
  orderedMilestones: Milestone[],
) {
  return orderedMilestones
    .filter((item) => item.order < milestone.order)
    .every((item) => item.status === 'APPROVED')
}

export function getMilestoneDisplayStatus(
  milestone: Milestone,
  orderedMilestones: Milestone[],
): MilestoneDisplayStatus {
  if (milestone.status === 'APPROVED') return 'APPROVED'
  if (milestone.status === 'REJECTED') return 'REJECTED'
  if (milestone.status === 'PENDING_REVIEW' || milestone.status === 'SUBMITTED') {
    return 'PENDING_REVIEW'
  }
  if (previousMilestonesApproved(milestone, orderedMilestones)) return 'CURRENT'
  return 'LOCKED'
}
