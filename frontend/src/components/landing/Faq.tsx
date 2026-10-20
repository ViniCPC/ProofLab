import { ChevronDown } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { landingContent } from '@/content/landing'

export function Faq() {
  const copy = landingContent.faq
  return <Section id="faq" tone="surface"><Container><SectionHeading eyebrow={copy.eyebrow} title={copy.title} /><div className="mt-10 max-w-3xl divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950/45">{copy.items.map((item) => <details key={item.question} className="group p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">{item.question}<ChevronDown aria-hidden className="size-4 shrink-0 text-cyan-300 transition-transform group-open:rotate-180" /></summary><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">{item.answer}</p></details>)}</div></Container></Section>
}
