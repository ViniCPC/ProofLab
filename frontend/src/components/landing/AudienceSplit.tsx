import { ArrowRight, FlaskConical, WalletCards } from 'lucide-react'
import { LinkButton } from '@/components/ui/LinkButton'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { landingContent } from '@/content/landing'

export function AudienceSplit() {
  const copy = landingContent.audience
  return <Section tone="accent"><Container><SectionHeading eyebrow={copy.eyebrow} title={copy.title} align="center" /><div className="mt-12 grid gap-4 md:grid-cols-2"><article className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-7"><FlaskConical aria-hidden className="size-7 text-cyan-200" /><h3 className="mt-6 text-2xl font-semibold text-white">{copy.researcher.title}</h3><p className="mt-3 max-w-md text-sm leading-6 text-slate-300">{copy.researcher.description}</p><LinkButton to="/create" className="mt-7">{copy.researcher.cta}<ArrowRight aria-hidden className="size-4" /></LinkButton></article><article className="rounded-2xl border border-purple-300/20 bg-purple-300/[0.06] p-7"><WalletCards aria-hidden className="size-7 text-purple-200" /><h3 className="mt-6 text-2xl font-semibold text-white">{copy.funder.title}</h3><p className="mt-3 max-w-md text-sm leading-6 text-slate-300">{copy.funder.description}</p><LinkButton to="/explore" variant="secondary" className="mt-7">{copy.funder.cta}<ArrowRight aria-hidden className="size-4" /></LinkButton></article></div></Container></Section>
}
