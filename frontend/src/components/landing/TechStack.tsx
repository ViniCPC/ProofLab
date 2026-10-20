import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { landingContent } from '@/content/landing'

export function TechStack() {
  const copy = landingContent.tech
  return <Section><Container><SectionHeading eyebrow={copy.eyebrow} title={copy.title} /><div className="mt-12 grid gap-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">{copy.nodes.map((node, index) => <div key={node} className="contents"><div className="rounded-xl border border-slate-800 bg-slate-950/55 p-5 text-center text-sm font-medium text-slate-200">{node}</div>{index < copy.nodes.length - 1 && <ArrowRight aria-hidden className="mx-auto hidden size-5 text-cyan-300 lg:block" />}</div>)}</div><div className="mt-8 flex flex-wrap gap-2">{copy.badges.map((badge) => <span key={badge} className="rounded-full border border-slate-700 bg-slate-950/45 px-3 py-1.5 font-mono text-xs text-slate-400">{badge}</span>)}</div></Container></Section>
}
