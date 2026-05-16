import type { ReactNode } from 'react'
import { ArrowRight, FlaskConical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface HeroAction {
  label: string
  to: string
}

interface HeroSectionProps {
  badge: string
  title: string
  subtitle: string
  primaryAction: HeroAction
  secondaryAction: HeroAction
  visual?: ReactNode
}

export function HeroSection({
  badge,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  visual,
}: HeroSectionProps) {
  return (
    <section className="grid min-h-[560px] items-center gap-8 overflow-hidden lg:grid-cols-[0.94fr_1.06fr]">
      <div className="relative z-10 py-8">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Badge status="Active" label={badge} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-300/25 bg-green-300/10 px-2.5 py-0.5 text-xs font-medium text-green-200">
            <FlaskConical className="size-3.5" />
            laboratorio + blockchain
          </span>
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          {subtitle}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to={primaryAction.to}>
            <Button size="lg">
              {primaryAction.label}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link to={secondaryAction.to}>
            <Button size="lg" variant="secondary">
              {secondaryAction.label}
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative min-h-[420px] md:min-h-[460px] lg:min-h-[560px]">
        {visual}
      </div>
    </section>
  )
}
