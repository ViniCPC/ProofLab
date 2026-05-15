import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn } from '@/lib/utils'

interface AnimatedFlowStep {
  icon: LucideIcon
  title: string
  description: string
}

interface AnimatedStepFlowProps {
  steps: AnimatedFlowStep[]
}

const toneStyles = [
  'text-cyan-200 border-cyan-300/25 bg-cyan-300/10',
  'text-green-200 border-green-300/25 bg-green-300/10',
  'text-purple-200 border-purple-300/25 bg-purple-300/10',
  'text-cyan-200 border-cyan-300/25 bg-cyan-300/10',
  'text-green-200 border-green-300/25 bg-green-300/10',
]

export function AnimatedStepFlow({ steps }: AnimatedStepFlowProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase text-cyan-300">
          fluxo verificável
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-50">
          Da proposta ao release, tudo acontece por etapas
        </h2>
      </div>

      <GlassPanel tone="cyan" className="p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-5">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="relative">
              <div
                className="prooflab-flow-card h-full rounded-lg border border-slate-800/85 bg-slate-950/58 p-4"
                style={{ '--flow-delay': `${index * 120}ms` } as CSSProperties}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      'grid size-10 place-items-center rounded-lg border',
                      toneStyles[index % toneStyles.length],
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="font-mono text-xs text-slate-600">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block">
                  <div className="absolute left-[calc(100%-4px)] top-9 z-20 h-px w-5 bg-gradient-to-r from-cyan-300/60 to-purple-300/40" />
                  <ArrowRight className="absolute left-[calc(100%+6px)] top-[30px] z-20 size-4 text-cyan-200/70" />
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassPanel>
    </section>
  )
}
