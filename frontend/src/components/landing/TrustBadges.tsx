import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { landingContent } from '@/content/landing'

export function TrustBadges() {
  return (
    <Section tone="surface" className="py-8 sm:py-10">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-between">
          {landingContent.trustBadges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/50 px-4 py-2 text-xs text-slate-400"
            >
              <Icon aria-hidden className="size-4 text-cyan-300" />
              {label}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
