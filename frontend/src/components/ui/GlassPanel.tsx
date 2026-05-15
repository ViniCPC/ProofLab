import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type GlassPanelTone = 'cyan' | 'purple' | 'green' | 'neutral'

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: GlassPanelTone
  interactive?: boolean
}

const toneStyles: Record<GlassPanelTone, string> = {
  cyan: 'border-cyan-300/18 shadow-[0_0_40px_-24px_rgba(34,211,238,0.75)]',
  purple:
    'border-purple-300/18 shadow-[0_0_40px_-24px_rgba(168,85,247,0.72)]',
  green: 'border-green-300/18 shadow-[0_0_40px_-24px_rgba(74,222,128,0.65)]',
  neutral: 'border-slate-700/70 shadow-[0_0_36px_-28px_rgba(226,232,240,0.55)]',
}

export function GlassPanel({
  tone = 'neutral',
  interactive,
  className,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-slate-950/48 backdrop-blur-2xl',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent',
        'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(115deg,rgba(255,255,255,0.075),transparent_28%,transparent_72%,rgba(34,211,238,0.055))]',
        'transition-all duration-300',
        toneStyles[tone],
        interactive && 'hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-slate-950/58',
        className,
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}
