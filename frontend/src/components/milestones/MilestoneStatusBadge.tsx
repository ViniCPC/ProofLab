import { Badge } from '@/components/ui/Badge'
import type { MilestoneDisplayStatus } from './milestoneStatus'

interface MilestoneStatusBadgeProps {
  status: MilestoneDisplayStatus
}

const statusLabels: Record<MilestoneDisplayStatus, string> = {
  LOCKED: 'Bloqueada',
  CURRENT: 'Atual',
  SUBMITTED: 'Relatório enviado',
  PENDING_REVIEW: 'Em votação',
  APPROVED: 'Aprovada',
  RELEASED: 'Liberada',
  REJECTED: 'Rejeitada',
}

export function MilestoneStatusBadge({ status }: MilestoneStatusBadgeProps) {
  const badgeStatusMap = {
    LOCKED: 'default',
    CURRENT: 'ACTIVE',
    SUBMITTED: 'SUBMITTED',
    PENDING_REVIEW: 'PENDING_REVIEW',
    APPROVED: 'APPROVED',
    RELEASED: 'COMPLETED',
    REJECTED: 'REJECTED',
  } as const

  return <Badge status={badgeStatusMap[status]} label={statusLabels[status]} />
}
