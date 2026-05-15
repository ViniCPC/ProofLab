import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RiskLevel } from '@/types'

interface RiskBadgeProps {
  risk: RiskLevel | null
  label?: string
  className?: string
}

const riskConfig = {
  LOW: {
    label: 'Baixo',
    icon: ShieldCheck,
    className: 'border-green-300/35 bg-green-300/10 text-green-200',
  },
  MEDIUM: {
    label: 'Médio',
    icon: ShieldQuestion,
    className: 'border-cyan-300/35 bg-cyan-300/10 text-cyan-200',
  },
  HIGH: {
    label: 'Alto',
    icon: ShieldAlert,
    className: 'border-purple-300/35 bg-purple-300/10 text-purple-200',
  },
} satisfies Record<
  RiskLevel,
  {
    label: string
    icon: typeof ShieldCheck
    className: string
  }
>

export function RiskBadge({ risk, label, className }: RiskBadgeProps) {
  const config = risk ? riskConfig[risk] : null
  const Icon = config?.icon ?? ShieldQuestion
  const displayLabel = label ?? config?.label ?? 'Pendente'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
        config?.className ?? 'border-slate-700 bg-slate-900/80 text-slate-400',
        className,
      )}
    >
      <Icon className="size-3.5" />
      {displayLabel}
    </span>
  )
}
