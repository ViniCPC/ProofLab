import { Bot, ScanLine } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { ResearchProject } from '@/types'
import { AIScoreGrid } from './AIScoreGrid'
import { RiskBadge } from './RiskBadge'

interface AIAnalysisCardProps {
  project: ResearchProject
}

export function AIAnalysisCard({ project }: AIAnalysisCardProps) {
  return (
    <Card glow="purple" className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2 text-purple-200">
          <Bot className="size-5" />
          <h2 className="text-lg font-semibold">Análise da IA</h2>
        </div>
        <RiskBadge risk={project.riskLevel} />
      </div>

      <div className="rounded-lg border border-purple-300/15 bg-purple-300/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-100">
          <ScanLine className="size-4" />
          Resumo para a comunidade
        </div>
        <p className="text-sm leading-6 text-slate-400">
          {project.aiSummary ??
            'A análise da IA ainda não foi gerada para esta pesquisa.'}
        </p>
      </div>

      <AIScoreGrid project={project} />
    </Card>
  )
}
