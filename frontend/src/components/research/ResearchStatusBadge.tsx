import { Badge } from '@/components/ui/Badge'
import type { ResearchDisplayStatus } from './researchStatus'

interface ResearchStatusBadgeProps {
  status: ResearchDisplayStatus
}

const statusLabels: Record<ResearchDisplayStatus, string> = {
  FUNDING: 'Funding',
  ACTIVE: 'Ativo',
  IN_REVIEW: 'Em revisão',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

export function ResearchStatusBadge({ status }: ResearchStatusBadgeProps) {
  return (
    <Badge
      status={status === 'IN_REVIEW' ? 'PENDING_REVIEW' : status}
      label={statusLabels[status]}
    />
  )
}
