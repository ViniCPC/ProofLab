import { Check } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { CopyableAddress } from '@/components/ui/CopyableAddress'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { landingContent } from '@/content/landing'
import { explorerUrl, PROGRAM_ID } from '@/utils/explorer'

export function TrustSection() {
  const copy = landingContent.trust
  return <Section id="confianca" tone="surface"><Container><div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-end"><div><SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} /><ul className="mt-8 space-y-4">{copy.rules.map((rule) => <li key={rule} className="flex gap-3 text-sm leading-6 text-slate-300"><Check aria-hidden className="mt-1 size-4 shrink-0 text-green-300" />{rule}</li>)}</ul></div><div className="rounded-2xl border border-slate-800 bg-slate-950/65 p-6"><p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-300">{copy.programLabel}</p><CopyableAddress address={PROGRAM_ID} className="mt-5 w-full" /><ExternalLink href={explorerUrl('address', PROGRAM_ID)} className="mt-4 text-sm">{copy.explorerLabel}</ExternalLink><p className="mt-8 border-t border-slate-800 pt-5 text-xs text-orange-200">{copy.disclaimer}</p></div></div></Container></Section>
}
