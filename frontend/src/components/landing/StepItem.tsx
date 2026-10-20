import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

interface StepItemProps {
  index: number
  icon: LucideIcon
  title: string
  description: string
  active: boolean
  onVisible: (index: number) => void
}

export function StepItem({
  index,
  icon: Icon,
  title,
  description,
  active,
  onVisible,
}: StepItemProps) {
  const ref = useRef<HTMLElement>(null)
  const visible = useInView(ref, 0.55)
  useEffect(() => {
    if (visible) onVisible(index)
  }, [index, onVisible, visible])
  return (
    <article
      ref={ref}
      className={cn(
        'relative border-l border-slate-800 pl-8 transition-colors',
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
    </article>
  )
}
