import { cn } from '@/lib/utils'
import type { MilestoneStatus, OnChainStatus, ProjectStatus } from '@/types'

type BadgeVariant =
  | ProjectStatus
  | MilestoneStatus
  | OnChainStatus
  | 'FUNDING'
  | 'AI'
  | 'default'

type BadgeStyleKey =
  | ProjectStatus
  | MilestoneStatus
  | 'FUNDING'
  | 'AI'
  | 'default'

const onChainStatusMap: Record<OnChainStatus, BadgeStyleKey> = {
  Funding: 'FUNDING',
  Active: 'ACTIVE',
  Completed: 'COMPLETED',
  Cancelled: 'CANCELLED',
}

const variantStyles: Record<BadgeStyleKey, string> = {
  DRAFT: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
  ACTIVE: 'border-purple-400/40 bg-purple-400/10 text-purple-200',
  CANCELLED: 'border-red-400/40 bg-red-400/10 text-red-200',
  COMPLETED: 'border-green-400/40 bg-green-400/10 text-green-200',
  FUNDING: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200',
  PENDING: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
  PENDING_REVIEW: 'border-yellow-400/40 bg-yellow-400/10 text-yellow-200',
  SUBMITTED: 'border-blue-400/40 bg-blue-400/10 text-blue-200',
  APPROVED: 'border-green-400/40 bg-green-400/10 text-green-200',
  REJECTED: 'border-red-400/40 bg-red-400/10 text-red-200',
  AI: 'border-green-300/35 bg-green-300/10 text-green-200',
  default: 'border-slate-600/40 bg-slate-600/10 text-slate-300',
}

interface BadgeProps {
  status: BadgeVariant
  label?: string
  className?: string
}

function normalizeStatus(status: BadgeVariant): BadgeStyleKey {
  if (
    status === 'Funding' ||
    status === 'Active' ||
    status === 'Completed' ||
    status === 'Cancelled'
  ) {
    return onChainStatusMap[status]
  }

  return status as BadgeStyleKey
}

export function Badge({ status, label, className }: BadgeProps) {
  const styleKey = normalizeStatus(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide',
        variantStyles[styleKey] ?? variantStyles.default,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {label ?? status}
    </span>
  )
}
