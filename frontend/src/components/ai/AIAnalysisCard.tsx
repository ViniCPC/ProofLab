import { Bot, RotateCcw, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ResearchProject } from '@/types'
import { AIScoreGrid } from './AIScoreGrid'
import { RiskBadge } from './RiskBadge'

interface AIAnalysisCardProps {
  project: ResearchProject
  onReanalyze?: () => void
  reanalyzing?: boolean
}

export function AIAnalysisCard({
  project,
  onReanalyze,
  reanalyzing,
}: AIAnalysisCardProps) {
  const failed = project.aiStatus === 'FAILED'

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
            (failed
              ? 'A análise da IA falhou para esta pesquisa.'
              : 'A análise da IA ainda não foi gerada para esta pesquisa.')}
        </p>
      </div>

      {project.aiRecommendation && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/55 p-4">
          <div className="mb-1 text-sm font-medium text-purple-100">
            Recomendação
          </div>
          <p className="text-sm leading-6 text-slate-400">
            {project.aiRecommendation}
          </p>
        </div>
      )}

      {failed && onReanalyze && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          loading={reanalyzing}
          onClick={onReanalyze}
        >
          <RotateCcw className="size-3.5" />
          Reanalisar com a IA
        </Button>
      )}

      <AIScoreGrid project={project} />
    </Card>
  )
}
