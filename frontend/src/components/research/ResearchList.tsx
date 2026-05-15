import { ResearchCard } from './ResearchCard'
import type { FundingStats, ResearchProject } from '@/types'

interface ResearchListProps {
  projects: ResearchProject[]
  fundingByProjectId: Record<string, FundingStats | null>
}

export function ResearchList({
  projects,
  fundingByProjectId,
}: ResearchListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ResearchCard
          key={project.id}
          project={project}
          funding={fundingByProjectId[project.id] ?? null}
        />
      ))}
    </div>
  )
}
