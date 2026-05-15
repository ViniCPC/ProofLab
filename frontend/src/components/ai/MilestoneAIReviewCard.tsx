import { Bot, CheckCircle2, Gauge, Percent, ShieldAlert } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Milestone } from '@/types'
import { RiskBadge } from './RiskBadge'

interface MilestoneAIReviewCardProps {
  milestone: Milestone
}

function hasReview(milestone: Milestone) {
  return (
    milestone.aiSummary !== null ||
    milestone.consistencyScore !== null ||
    milestone.completionEstimate !== null ||
    milestone.aiRiskLevel !== null
  )
}

function getRecommendation(milestone: Milestone) {
  if (!hasReview(milestone)) {
    return 'Aguardando envio do relatório para a IA gerar uma recomendação.'
  }

  if (
    milestone.aiRiskLevel === 'HIGH' ||
    (milestone.consistencyScore ?? 100) < 50 ||
    (milestone.completionEstimate ?? 100) < 60
  ) {
    return 'Recomenda revisar evidências antes de aprovar a liberação dos recursos.'
  }

  if (
    (milestone.completionEstimate ?? 0) >= 80 &&
    (milestone.consistencyScore ?? 0) >= 70
  ) {
    return 'Recomenda seguir para votação da comunidade com baixo atrito.'
  }

  return 'Recomenda votação com atenção aos pontos técnicos destacados.'
}

function formatScore(score: number | null) {
  return typeof score === 'number' ? `${score}/100` : 'Pendente'
}

export function MilestoneAIReviewCard({
  milestone,
}: MilestoneAIReviewCardProps) {
  const completionEstimate = milestone.completionEstimate ?? 0
  const consistencyScore = milestone.consistencyScore ?? 0

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
    </div>
  )
}
