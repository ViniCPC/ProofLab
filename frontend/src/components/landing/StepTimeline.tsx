import { useCallback, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { landingContent } from '@/content/landing'
import { ProductShot, type ProductShotVariant } from './ProductShot'
import { StepItem } from './StepItem'

export function StepTimeline() {
  const copy = landingContent.howItWorks
  const [active, setActive] = useState(0)
  const handleVisible = useCallback((index: number) => {
    setActive((current) => (current === index ? current : index))
  }, [])

  return (
    <Section id="como-funciona" tone="surface">
      <Container>
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />
        <div className="mt-12 grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div className="space-y-10">
            {copy.steps.map((step, index) => (
              <StepItem
                key={step.title}
                index={index}
                {...step}
                active={active === index}
                onVisible={handleVisible}
              />
            ))}
          </div>
          <div className="lg:hidden">
            <ProductShot variant={active as ProductShotVariant} />
          </div>
          <div className="sticky top-28 hidden lg:block">
            <ProductShot variant={active as ProductShotVariant} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
