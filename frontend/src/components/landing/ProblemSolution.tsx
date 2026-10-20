import { Container } from '@/components/ui/Container'
import { IconBadge } from '@/components/ui/IconBadge'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { landingContent } from '@/content/landing'

export function ProblemSolution() {
  const copy = landingContent.problemSolution

  return (
    <Section id="problema" spacing="compact">
      <Container>
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {copy.items.map((item) => (
            <article
              key={item.problem}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-6"
            >
              <IconBadge icon={item.icon} tone={item.tone} />
              <p className="mt-6 text-sm font-semibold text-white">{item.problem}</p>
              <div className="my-4 h-px bg-slate-800" />
              <p className="text-sm leading-6 text-slate-400">{item.solution}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
