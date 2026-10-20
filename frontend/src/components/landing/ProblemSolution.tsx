import type { LucideIcon } from 'lucide-react'
import { IconBadge } from '@/components/ui/IconBadge'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { landingContent } from '@/content/landing'

export function ProblemSolution() {
  const copy = landingContent.problemSolution
  return <Section><Container><SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} /><div className="mt-12 grid gap-4 md:grid-cols-3">{copy.items.map((item) => { const Icon = item.icon as LucideIcon; return <article key={item.problem} className="rounded-2xl border border-slate-800 bg-slate-950/45 p-6"><IconBadge icon={Icon} tone={item.tone} /><p className="mt-6 text-sm font-medium text-orange-200">{item.problem}</p><div className="my-5 h-px bg-slate-800" /><p className="text-base leading-7 text-slate-300">{item.solution}</p></article> })}</div></Container></Section>
}
