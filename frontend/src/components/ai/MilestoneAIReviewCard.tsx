import {
  Bot,
  CheckCircle2,
  Gauge,
  Percent,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Milestone } from '@/types'
import { RiskBadge } from './RiskBadge'

interface MilestoneAIReviewCardProps {
  milestone: Milestone
  onReanalyze?: () => void
  reanalyzing?: boolean
}

function getRecommendation(milestone: Milestone) {
  if (milestone.aiRecommendation) {
    return milestone.aiRecommendation
  }

  if (milestone.aiStatus === 'FAILED') {
    return 'A análise da IA falhou para esta entrega.'
  }

  return 'Aguardando envio do relatório para a IA gerar uma recomendação.'
}

function formatScore(score: number | null) {
  return typeof score === 'number' ? `${score}/100` : 'Pendente'
}

export function MilestoneAIReviewCard({
  milestone,
  onReanalyze,
  reanalyzing,
}: MilestoneAIReviewCardProps) {
  const completionEstimate = milestone.completionEstimate ?? 0
  const consistencyScore = milestone.consistencyScore ?? 0
  const failed = milestone.aiStatus === 'FAILED'

  return (
    <div className="rounded-lg border border-green-300/15 bg-green-300/5 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-green-200">
          <Bot className="size-4" />
          <p className="text-sm font-medium">Revisão da IA</p>
        </div>
        <RiskBadge risk={milestone.aiRiskLevel} />
      </div>

      <p className="text-sm leading-6 text-slate-500">
        {milestone.aiSummary ??
          'A IA ainda não analisou uma entrega para esta milestone.'}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ProgressBar
          value={completionEstimate}
          label="Estimativa de conclusão"
          tone="green"
        />
        <ProgressBar
          value={consistencyScore}
          label="Score de consistência"
          tone="cyan"
        />
      </div>

      <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <Percent className="size-3.5 text-green-200" />
          {completionEstimate}% concluído
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="size-3.5 text-cyan-200" />
          {formatScore(milestone.consistencyScore)}
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-3.5 text-purple-200" />
          {milestone.aiRiskLevel ?? 'Risco pendente'}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/55 p-3">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-green-200">
          <CheckCircle2 className="size-3.5" />
          Recomendação
        </div>
        <p className="text-sm leading-6 text-slate-400">
          {getRecommendation(milestone)}
        </p>
      </div>

      {failed && onReanalyze && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-3"
          loading={reanalyzing}
          onClick={onReanalyze}
        >
          <RotateCcw className="size-3.5" />
          Reanalisar com a IA
        </Button>
      )}
    </div>
  )
}
