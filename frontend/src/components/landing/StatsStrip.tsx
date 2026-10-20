import { Database, DollarSign, Milestone } from 'lucide-react'
import type { ResearchStats } from '@/types'
import { landingContent } from '@/content/landing'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

export function StatsStrip({ stats, loading }: { stats: ResearchStats | null; loading: boolean }) {
  const values = loading || !stats ? ['—', '—', '—'] : [String(stats.totalProjects), `${Number(stats.escrowValue).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} USDC`, String(stats.releasedMilestones)]
  const items = [{ icon: Database, label: landingContent.stats.projects }, { icon: DollarSign, label: landingContent.stats.escrow }, { icon: Milestone, label: landingContent.stats.released }]
  return <Section tone="surface" className="py-8 sm:py-10"><Container><p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-slate-500">{landingContent.stats.eyebrow}</p><div className="grid gap-6 sm:grid-cols-3">{items.map(({ icon: Icon, label }, index) => <div key={label} className="flex items-center gap-4"><Icon aria-hidden className="size-5 text-cyan-300" /><div><p className="text-2xl font-semibold text-white">{values[index]}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div></div>)}</div></Container></Section>
}
