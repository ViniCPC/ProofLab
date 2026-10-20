import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function BrowserFrame({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl shadow-cyan-950/50',
        className,
      )}
    >
      <div className="flex h-10 items-center gap-2 border-b border-white/10 bg-slate-900/90 px-4">
        <span className="size-2.5 rounded-full bg-red-300/70" />
        <span className="size-2.5 rounded-full bg-yellow-300/70" />
        <span className="size-2.5 rounded-full bg-green-300/70" />
        <span className="ml-3 min-w-0 flex-1 truncate rounded-md bg-slate-950/70 px-3 py-1 font-mono text-[10px] text-slate-500">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}
