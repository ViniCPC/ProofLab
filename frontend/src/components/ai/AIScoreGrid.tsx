import { Activity, BrainCircuit, Gauge, Sparkles } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'
import type { ResearchProject, RiskLevel } from '@/types'
import { RiskBadge } from './RiskBadge'

interface AIScoreGridProps {
  project: Pick<
    ResearchProject,
    'innovationScore' | 'feasibilityScore' | 'complexityLevel' | 'riskLevel'
  >
}

interface NumericScoreItem {
  kind: 'score'
  label: string
  value: number | null
  icon: typeof Sparkles
  tone: 'cyan' | 'purple' | 'green'
}

interface RiskScoreItem {
  kind: 'risk'
  label: string
  value: RiskLevel | null
  icon: typeof Sparkles
}

type ScoreItem = NumericScoreItem | RiskScoreItem

const complexityLabel: Record<RiskLevel, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
}

function formatScore(value: number | null) {
  return typeof value === 'number' ? `${value}/100` : 'Pendente'
}

function getScoreItems(project: AIScoreGridProps['project']): ScoreItem[] {
  return [
    {
      kind: 'score',
      label: 'Score de inovação',
      value: project.innovationScore,
      icon: Sparkles,
      tone: 'purple',
    },
    {
      kind: 'score',
      label: 'Score de viabilidade',
      value: project.feasibilityScore,
      icon: Gauge,
      tone: 'cyan',
    },
    {
      kind: 'risk',
      label: 'Complexidade',
      value: project.complexityLevel,
      icon: BrainCircuit,
    },
    {
      kind: 'risk',
      label: 'Risco',
      value: project.riskLevel,
      icon: Activity,
    },
  ]
}

function NumericScore({ item }: { item: NumericScoreItem }) {
  const Icon = item.icon

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{item.label}</p>
        <Icon
          className={cn(
            'size-4',
            item.tone === 'purple' && 'text-purple-200',
            item.tone === 'cyan' && 'text-cyan-200',
            item.tone === 'green' && 'text-green-200',
          )}
        />
      </div>
      <p className="mt-2 font-mono text-lg text-slate-100">
        {formatScore(item.value)}
      </p>
      <ProgressBar value={item.value ?? 0} tone={item.tone} className="mt-3" />
    </div>
  )
}

function RiskScore({ item }: { item: RiskScoreItem }) {
  const Icon = item.icon
  const label =
    item.label === 'Complexidade' && item.value
      ? complexityLabel[item.value]
      : undefined

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{item.label}</p>
        <Icon className="size-4 text-green-200" />
      </div>
      <div className="mt-3">
        <RiskBadge risk={item.value} label={label} />
      </div>
    </div>
  )
}

export function AIScoreGrid({ project }: AIScoreGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {getScoreItems(project).map((item) =>
        item.kind === 'score' ? (
          <NumericScore key={item.label} item={item} />
        ) : (
          <RiskScore key={item.label} item={item} />
        ),
      )}
    </div>
  )
}
