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
  const [vote, ai, ...smallCards] = copy.items
  return (
    <Section id="recursos">
      <Container>
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} />
        <Reveal className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <BentoCard size="lg" title={vote.title} description={vote.description}>
            <VoteProgress
              summary={{ approved: 3, rejected: 1, total: 4 }}
              eligibleVoters={5}
            />
          </BentoCard>
          <BentoCard size="lg" title={ai.title} description={ai.description}>
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
            title="Progresso condicionado"
            description="A barra acompanha a entrega; o capital só avança depois da decisão registrada."
          >
            <ProgressBar value={68} label="Interface ilustrativa" tone="green" />
          </BentoCard>
          {smallCards.map((item) => (
            <BentoCard
              key={item.title}
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
