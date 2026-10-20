import type { FocusEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { landingContent } from '@/content/landing'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { ProductShot, type ProductShotVariant } from './ProductShot'
import { StepItem } from './StepItem'

export function StepTimeline() {
  const copy = landingContent.howItWorks
  const [active, setActive] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  const selectStep = useCallback((index: number) => {
    setActive(index)
    setCycle((current) => current + 1)
  }, [])

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return

    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % copy.steps.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [copy.steps.length, cycle, isPaused, prefersReducedMotion])

  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget
    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      setIsPaused(false)
    }
  }, [])

  return (
    <Section id="como-funciona" spacing="compact" tone="surface">
      <Container>
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />
        <div
          className="mt-12 grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={handleBlur}
        >
          <div className="lg:hidden">
            <div className="sticky top-20 z-10">
              <ProductShot variant={active as ProductShotVariant} />
            </div>
          </div>
          <div className="space-y-10">
            {copy.steps.map((step, index) => (
              <StepItem
                key={step.title}
                index={index}
                {...step}
                active={active === index}
                onSelect={() => selectStep(index)}
              />
            ))}
          </div>
          <div className="sticky top-28 hidden lg:block">
            <ProductShot variant={active as ProductShotVariant} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
