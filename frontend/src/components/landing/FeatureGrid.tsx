import { IconBadge } from '@/components/ui/IconBadge'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { landingContent } from '@/content/landing'

export function FeatureGrid() {
  const copy = landingContent.features
  return <Section id="recursos"><Container><SectionHeading eyebrow={copy.eyebrow} title={copy.title} /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{copy.items.map((item) => <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/45 p-6 transition-colors hover:border-cyan-300/25"><IconBadge icon={item.icon} tone={item.tone} /><h3 className="mt-5 text-base font-semibold text-white">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p></article>)}</div></Container></Section>
}
