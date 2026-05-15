import { cn } from '@/lib/utils'

type ProgressTone = 'cyan' | 'purple' | 'green'

interface ProgressBarProps {
  value: number
  label?: string
  tone?: ProgressTone
  className?: string
}

const toneStyles: Record<ProgressTone, string> = {
  cyan: 'bg-cyan-300',
  purple: 'bg-purple-300',
  green: 'bg-green-300',
}

export function ProgressBar({
  value,
  label,
  tone = 'cyan',
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100)

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">{label}</span>
          <span className="font-mono text-cyan-200">{clampedValue}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn('h-full rounded-full', toneStyles[tone])}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
