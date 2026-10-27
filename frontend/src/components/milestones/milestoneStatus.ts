import type { Milestone } from '@/types'

export type MilestoneDisplayStatus =
  | 'LOCKED'
  | 'CURRENT'
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'RELEASED'
  | 'REJECTED'

/** SUBMITTED means the report is in, but voting has not been opened on-chain yet. */
export function isVotingOpen(milestone: Milestone) {
  return milestone.status === 'PENDING_REVIEW'
}

// The contract only advances to the next milestone after the previous one is released.
function previousMilestonesReleased(
  milestone: Milestone,
  orderedMilestones: Milestone[],
) {
  return orderedMilestones
    .filter((item) => item.order < milestone.order)
    .every((item) => item.status === 'APPROVED' && Boolean(item.releaseTransactionHash))
}

export function getMilestoneDisplayStatus(
  milestone: Milestone,
  orderedMilestones: Milestone[],
): MilestoneDisplayStatus {
  if (milestone.status === 'APPROVED') {
    return milestone.releaseTransactionHash ? 'RELEASED' : 'APPROVED'
  }
  if (milestone.status === 'REJECTED') return 'REJECTED'
  if (milestone.status === 'SUBMITTED') return 'SUBMITTED'
  if (milestone.status === 'PENDING_REVIEW') return 'PENDING_REVIEW'
  if (previousMilestonesReleased(milestone, orderedMilestones)) return 'CURRENT'
  return 'LOCKED'
}
