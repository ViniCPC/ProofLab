import type { LucideIcon } from 'lucide-react'
import type { MouseEventHandler } from 'react'
import { cn } from '@/lib/utils'

interface StepItemProps {
  index: number
  icon: LucideIcon
  title: string
  description: string
  active: boolean
  onSelect: MouseEventHandler<HTMLButtonElement>
}

export function StepItem({
  index,
  icon: Icon,
  title,
  description,
  active,
  onSelect,
}: StepItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'relative block w-full border-l border-slate-800 pl-8 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950',
        active && 'border-cyan-300/70',
      )}
    >
      <span
        className={cn(
          'absolute -left-3 top-0 grid size-6 place-items-center rounded-full border text-[10px] font-semibold',
          active
            ? 'border-cyan-300 bg-cyan-300 text-slate-950'
            : 'border-slate-700 bg-slate-950 text-slate-500',
        )}
      >
        {index + 1}
      </span>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'grid size-10 place-items-center rounded-xl border',
            active
              ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200'
              : 'border-slate-800 bg-slate-950/50 text-slate-500',
          )}
        >
          <Icon aria-hidden className="size-4" />
        </span>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">{description}</p>
    </button>
  )
}
