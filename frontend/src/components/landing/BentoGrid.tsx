import { Container } from '@/components/ui/Container'
import { IconBadge } from '@/components/ui/IconBadge'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AIScoreGrid } from '@/components/ai/AIScoreGrid'
import { VoteProgress } from '@/components/voting/VoteProgress'
import { Reveal } from '@/components/ui/Reveal'
import { landingContent } from '@/content/landing'
import { BentoCard } from './BentoCard'

export function BentoGrid() {
  const copy = landingContent.features
  const vote = copy.items.find((item) => item.visual === 'vote') ?? copy.items[0]
  const ai = copy.items.find((item) => item.visual === 'ai') ?? copy.items[0]
  const progress =
    copy.items.find((item) => item.visual === 'progress') ?? copy.items[0]
  const smallCards = copy.items.filter((item) => item.visual === 'icon')

  return (
    <Section id="recursos" spacing="compact">
      <Container>
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} />
        <Reveal className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-12">
          <BentoCard
            size="lg"
            className="lg:col-span-6"
            title={vote.title}
            description={vote.description}
          >
            <VoteProgress
              summary={{ approved: 3, rejected: 1, total: 4 }}
              eligibleVoters={5}
            />
          </BentoCard>
          <BentoCard
            size="lg"
            className="lg:col-span-6"
            title={ai.title}
            description={ai.description}
          >
            <AIScoreGrid
              project={{
                innovationScore: 82,
                feasibilityScore: 74,
                complexityLevel: 'MEDIUM',
                riskLevel: 'LOW',
              }}
            />
          </BentoCard>
          <BentoCard
            size="lg"
            className="lg:col-span-6"
            title={progress.title}
            description={progress.description}
          >
            <ProgressBar value={68} label="Interface ilustrativa" tone="green" />
          </BentoCard>
          {smallCards.map((item) => (
            <BentoCard
              key={item.title}
              className="lg:col-span-2"
              title={item.title}
              description={item.description}
            >
              <IconBadge icon={item.icon} tone={item.tone} />
            </BentoCard>
          ))}
        </Reveal>
      </Container>
    </Section>
  )
}
