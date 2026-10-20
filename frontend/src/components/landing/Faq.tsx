import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { landingContent } from '@/content/landing'
import { FaqItem } from './FaqItem'

export function Faq() {
  const copy = landingContent.faq
  return (
    <Section id="faq" spacing="compact" tone="surface">
      <Container>
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} />
        <div className="mt-10 max-w-3xl divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950/45">
          {copy.items.map((item) => (
            <FaqItem key={item.question} {...item} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
