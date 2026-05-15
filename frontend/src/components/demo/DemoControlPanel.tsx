import { Link } from 'react-router-dom'
import { Play, RotateCcw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { DemoScenario, DemoSummary } from '@/types/demo'

interface DemoControlPanelProps {
  summary: DemoSummary | null
  activeAction: DemoScenario | 'seed' | null
  onSeed: () => Promise<void>
  onScenario: (scenario: DemoScenario) => Promise<void>
}

const scenarioButtons: Array<{
  scenario: DemoScenario
  label: string
  description: string
}> = [
  {
    scenario: 'funding',
    label: 'Funding',
    description: 'Projeto ativo com contribuições prontas.',
  },
  {
    scenario: 'pending-review',
    label: 'Revisão',
    description: 'Milestone aberta para voto da comunidade.',
  },
  {
    scenario: 'approved',
    label: 'Aprovação',
    description: 'Votos simulados para liberar a etapa.',
  },
  {
    scenario: 'cancelled',
    label: 'Refund',
    description: 'Projeto cancelado para demonstrar reembolso.',
  },
  {
    scenario: 'completed',
    label: 'Release final',
    description: 'Projeto concluído para encerrar a narrativa.',
  },
]

export function DemoControlPanel({
  summary,
  activeAction,
  onSeed,
  onScenario,
}: DemoControlPanelProps) {
  const projectUrl = summary ? `/research/${summary.primaryProjectId}` : '/explore'

  return (
    <Card glow="cyan" className="space-y-5">
      <div className="flex items-center gap-2 text-cyan-200">
        <ShieldCheck className="size-5" />
        <h2 className="text-lg font-semibold">Painel da demo</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="secondary"
          loading={activeAction === 'seed'}
          onClick={() => void onSeed()}
        >
          <RotateCcw className="size-4" />
          Recriar seed
        </Button>
        <Link
          to={projectUrl}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
        >
          <Play className="size-4" />
          Abrir projeto demo
        </Link>
      </div>

      <div className="grid gap-3">
        {scenarioButtons.map(({ scenario, label, description }) => (
          <button
            key={scenario}
            type="button"
            onClick={() => void onScenario(scenario)}
            disabled={activeAction !== null}
            className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-left transition hover:border-purple-300/40 hover:bg-purple-300/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="block text-sm font-semibold text-slate-100">
              {activeAction === scenario ? 'Aplicando...' : label}
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              {description}
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}
