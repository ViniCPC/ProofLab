import { ArrowRight } from 'lucide-react'
import { LinkButton } from '@/components/ui/LinkButton'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { landingContent } from '@/content/landing'
import { ProductShot } from './ProductShot'
import { TrustBadges } from './TrustBadges'

export function ProductShowcase() {
  const copy = landingContent.product

  return (
    <Section id="produto" spacing="compact" tone="surface">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow={copy.eyebrow}
              title={copy.title}
              description={copy.description}
            />
            <LinkButton to="/explore" variant="secondary" className="mt-7">
              {copy.cta}
              <ArrowRight aria-hidden className="size-4" />
            </LinkButton>
            <p className="mt-5 max-w-md text-xs leading-5 text-slate-500">
              {copy.note}
            </p>
          </div>
          <ProductShot variant={2} />
        </div>
        <div className="mt-12">
          <TrustBadges embedded />
        </div>
      </Container>
    </Section>
  )
}
