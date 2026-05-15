import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatCard } from '@/components/ui/StatCard'
import type { MilestoneDraft } from '@/components/milestones/MilestoneFormItem'

interface CreateResearchPreviewProps {
  title: string
  category: string
  totalAmount: string
  milestones: MilestoneDraft[]
}

function toNumber(value: string) {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function formatAmount(value: number) {
  return value.toLocaleString('pt-BR', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 2,
  })
}

export function CreateResearchPreview({
  title,
  category,
  totalAmount,
  milestones,
}: CreateResearchPreviewProps) {
  const total = toNumber(totalAmount)
  const milestoneTotal = milestones.reduce(
    (sum, milestone) => sum + toNumber(milestone.amount),
    0,
  )
  const progress = total > 0 ? Math.min((milestoneTotal / total) * 100, 100) : 0
  const hasMismatch = total > 0 && Math.abs(total - milestoneTotal) > 0.000001

  return (
    <Card glow="cyan" className="sticky top-24 space-y-5">
      <div>
        <p className="font-mono text-xs uppercase text-cyan-300">
          Prévia da pesquisa
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-100">
          {title || 'Pesquisa sem título'}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge status="AI" label="IA pronta para análise" />
          <Badge status="DRAFT" label={category || 'Sem categoria'} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <StatCard label="Meta total" value={`${formatAmount(total)} USDC`} />
        <StatCard
          label="Valor em etapas"
          value={`${formatAmount(milestoneTotal)} USDC`}
          tone={hasMismatch ? 'purple' : 'green'}
        />
        <StatCard
          label="Quantidade de etapas"
          value={String(milestones.length).padStart(2, '0')}
          tone="purple"
        />
      </div>

      <ProgressBar
        value={Number(progress.toFixed(2))}
        label="Etapas alocadas"
        tone={hasMismatch ? 'purple' : 'green'}
      />

      <div className="space-y-3">
        {milestones.map((milestone) => (
          <div
            key={milestone.order}
            className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-200">
                {milestone.title || `Etapa ${milestone.order}`}
              </p>
              <span className="font-mono text-xs text-cyan-200">
                {formatAmount(toNumber(milestone.amount))}
              </span>
            </div>
          </div>
        ))}
      </div>

      {hasMismatch && (
        <p className="rounded-lg border border-purple-300/25 bg-purple-300/10 p-3 text-xs leading-5 text-purple-100">
          O valor das milestones ainda não bate com a meta total. Você pode
          salvar mesmo assim, mas a revisão fica mais clara quando os valores
          fecham.
        </p>
      )}
    </Card>
  )
}
