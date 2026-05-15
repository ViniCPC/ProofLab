import { cn } from '@/lib/utils'
import type { OnChainStatus, MilestoneStatus } from '@/types'

type StatusVariant = OnChainStatus | MilestoneStatus | 'default'

const variantStyles: Record<StatusVariant, string> = {
  Funding:      'border-cyan-500/40   bg-cyan-500/10   text-cyan-300',
  Active:       'border-purple-500/40 bg-purple-500/10 text-purple-300',
  Completed:    'border-green-500/40  bg-green-500/10  text-green-300',
  Cancelled:    'border-red-500/40    bg-red-500/10    text-red-300',
  PENDING:      'border-slate-500/40  bg-slate-500/10  text-slate-300',
  PENDING_REVIEW:'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
  SUBMITTED:    'border-blue-500/40   bg-blue-500/10   text-blue-300',
  APPROVED:     'border-green-500/40  bg-green-500/10  text-green-300',
  REJECTED:     'border-red-500/40    bg-red-500/10    text-red-300',
  default:      'border-slate-600/40  bg-slate-600/10  text-slate-400',
}

interface BadgeProps {
  status: StatusVariant
  label?: string
  className?: string
}

export function Badge({ status, label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide',
        variantStyles[status] ?? variantStyles.default,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {label ?? status}
    </span>
  )
}
