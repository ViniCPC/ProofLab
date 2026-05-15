import type { LucideIcon } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn } from '@/lib/utils'

type FeatureTone = 'cyan' | 'purple' | 'green'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  tone: FeatureTone
}

interface FeatureGridProps {
  features: Feature[]
}

const toneStyles: Record<FeatureTone, string> = {
  cyan: 'text-cyan-300',
  purple: 'text-purple-300',
  green: 'text-green-300',
}

export function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase text-green-300">
          diferenciais
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-50">
          Feito para ciencia aberta e funding verificavel
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description, tone }) => (
          <GlassPanel key={title} tone={tone} interactive className="p-5">
            <Icon className={cn('mb-3 size-6', toneStyles[tone])} />
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </GlassPanel>
        ))}
      </div>
    </section>
  )
}
