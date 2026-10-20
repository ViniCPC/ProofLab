import { Play } from 'lucide-react'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { landingContent } from '@/content/landing'

export function CtaBanner() {
  const copy = landingContent.cta
  return (
    <Section>
      <Container>
        <div className="flex flex-col gap-7 rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.12] via-slate-950/80 to-purple-300/[0.1] p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
              {copy.eyebrow}
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold text-white sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
              {copy.description}
            </p>
          </div>
          <ExternalLink
            href={copy.videoUrl}
            className="w-fit rounded-lg border border-cyan-300/30 bg-cyan-300 px-5 py-3 font-medium text-slate-950 hover:bg-cyan-200"
          >
            <Play aria-hidden className="size-4" />
            {copy.button}
          </ExternalLink>
        </div>
      </Container>
    </Section>
  )
}
