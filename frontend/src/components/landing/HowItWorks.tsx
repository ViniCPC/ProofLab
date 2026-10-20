import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { landingContent } from '@/content/landing'
import { AnimatedStepFlow } from '@/components/layout/AnimatedStepFlow'

export function HowItWorks() {
  const copy = landingContent.howItWorks
  return <Section id="como-funciona" tone="surface"><Container><AnimatedStepFlow steps={copy.steps} eyebrow={copy.eyebrow} title={copy.title} description={copy.description} /></Container></Section>
}
