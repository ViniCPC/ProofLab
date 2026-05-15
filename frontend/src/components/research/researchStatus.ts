import type { ProjectStatus, ResearchProject } from '@/types'

export type ResearchDisplayStatus =
  | 'FUNDING'
  | 'ACTIVE'
  | 'IN_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'

function mapProjectStatus(status: ProjectStatus): ResearchDisplayStatus {
  const statusMap: Record<ProjectStatus, ResearchDisplayStatus> = {
    DRAFT: 'IN_REVIEW',
    ACTIVE: 'ACTIVE',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
  }

  return statusMap[status]
}

export function getResearchDisplayStatus(
  project: ResearchProject,
): ResearchDisplayStatus {
  if (project.onChainStatus === 'Funding') {
    return 'FUNDING'
  }

  return mapProjectStatus(project.status)
}
