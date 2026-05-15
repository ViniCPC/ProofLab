import { ArrowRight, FlaskConical } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroAsset from '@/assets/hero.png'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatCard } from '@/components/ui/StatCard'

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
}

export function HeroSection({
  badge,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
}: HeroSectionProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <GlassPanel
        tone="cyan"
        className="flex min-h-[440px] flex-col justify-between p-6 sm:p-8"
      >
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge status="Active" label={badge} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-300/25 bg-green-300/10 px-2.5 py-0.5 text-xs font-medium text-green-200">
              <FlaskConical className="size-3.5" />
              laboratorio + blockchain
            </span>
          </div>
          <h1 className="max-w-3xl text-4xl font-bold text-slate-50 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
            {subtitle}
          </p>
        </div>

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
      </GlassPanel>

      <GlassPanel tone="purple" className="p-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <p className="font-mono text-xs uppercase text-cyan-300">
              painel da demo
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-100">
              Pesquisa em custodia
            </h2>
          </div>
          <img
            src={heroAsset}
            alt=""
            className="h-16 w-16 object-contain opacity-90"
          />
        </div>

        <div className="space-y-6 pt-5">
          <ProgressBar value={72} label="Financiado" />
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Arrecadado" value="$184K" tone="cyan" />
            <StatCard label="Etapas" value="04" tone="purple" />
            <StatCard label="Votos" value="128" tone="green" />
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-500">Ultimo sinal de IA</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Entrega consistente com o plano aprovado. Risco operacional baixo
              e evidencias suficientes para abrir votacao.
            </p>
          </div>
        </div>
      </GlassPanel>
    </section>
  )
}
