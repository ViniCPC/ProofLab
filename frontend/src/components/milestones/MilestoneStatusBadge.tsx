import { Badge } from '@/components/ui/Badge'
import type { MilestoneDisplayStatus } from './milestoneStatus'

interface MilestoneStatusBadgeProps {
  status: MilestoneDisplayStatus
}

const statusLabels: Record<MilestoneDisplayStatus, string> = {
  LOCKED: 'Bloqueada',
  CURRENT: 'Atual',
  PENDING_REVIEW: 'Em revisão',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
}

export function MilestoneStatusBadge({ status }: MilestoneStatusBadgeProps) {
  const badgeStatusMap = {
    LOCKED: 'default',
    CURRENT: 'ACTIVE',
    PENDING_REVIEW: 'PENDING_REVIEW',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
  } as const

  return <Badge status={badgeStatusMap[status]} label={statusLabels[status]} />
}
