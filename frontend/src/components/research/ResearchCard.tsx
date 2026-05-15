import { ArrowRight, Bot } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import type { FundingStats, ResearchProject } from '@/types'
import { ResearchStatusBadge } from './ResearchStatusBadge'
import { getResearchDisplayStatus } from './researchStatus'

interface ResearchCardProps {
  project: ResearchProject
  funding: FundingStats | null
}

function truncateDescription(description: string) {
  if (description.length <= 150) {
    return description
  }

  return `${description.slice(0, 147)}...`
}

function formatAmount(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 2,
  })
}

function getAiScore(project: ResearchProject) {
  const scores = [project.innovationScore, project.feasibilityScore].filter(
    (score): score is number => typeof score === 'number',
  )

  if (!scores.length) {
    return null
  }

  const totalScore = scores.reduce((sum, score) => sum + score, 0)
  return Math.round(totalScore / scores.length)
}

export function ResearchCard({ project, funding }: ResearchCardProps) {
  const status = getResearchDisplayStatus(project)
  const fundingPercentage = funding?.fundingPercentage ?? 0
  const totalRaised = funding?.totalRaised ?? '0'
  const aiScore = getAiScore(project)

  return (
    <Card glow="cyan" className="flex min-h-full flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <ResearchStatusBadge status={status} />
        <span className="font-mono text-xs text-slate-500">
          {formatAmount(project.totalAmount)} USDC
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="line-clamp-2 text-lg font-semibold text-slate-100">
          {project.title}
        </h2>
        <p className="text-sm leading-6 text-slate-500">
          {truncateDescription(project.description)}
        </p>
      </div>

      <ProgressBar
        value={Number(fundingPercentage.toFixed(2))}
        label={`${formatAmount(totalRaised)} USDC arrecadados`}
      />

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Bot className="size-4 text-green-300" />
          {aiScore === null ? 'IA pendente' : `Score IA ${aiScore}/100`}
        </div>
        <Link to={`/research/${project.id}`}>
          <Button size="sm" variant="secondary">
            Ver projeto
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
