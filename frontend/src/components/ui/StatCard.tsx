import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  icon?: LucideIcon
  tone?: 'cyan' | 'purple' | 'green'
  className?: string
}

const toneStyles = {
  cyan: 'text-cyan-200',
  purple: 'text-purple-200',
  green: 'text-green-200',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'cyan',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-800 bg-slate-950/60 p-3',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{label}</p>
        {Icon && <Icon className={cn('size-4', toneStyles[tone])} />}
      </div>
      <p className="mt-1 font-mono text-lg text-slate-100">{value}</p>
    </div>
  )
}
