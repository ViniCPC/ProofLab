import type { ResearchProject } from '@/types'
import { AIAnalysisCard } from './AIAnalysisCard'

interface AiAnalysisPanelProps {
  project: ResearchProject
}

export function AiAnalysisPanel({ project }: AiAnalysisPanelProps) {
  return <AIAnalysisCard project={project} />
}
