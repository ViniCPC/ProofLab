import { FundingForm } from './FundingForm'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatCard } from '@/components/ui/StatCard'
import type { FundingStats, ResearchProject } from '@/types'
import { formatUsdc } from '@/utils/format'

interface FundingPanelProps {
  project: ResearchProject
  funding: FundingStats | null
  loading?: boolean
  onFund: (amount: string) => Promise<void>
}

function getFundingNotice(project: ResearchProject) {
  if (!project.onChainProjectAddress) {
    return 'As contribuições abrem quando o pesquisador registrar o projeto na Solana.'
  }

  switch (project.onChainStatus) {
    case 'Active':
      return 'Meta atingida. O escrow está completo e as etapas já podem ser entregues.'
    case 'Completed':
      return 'Projeto concluído. Todas as etapas foram liberadas.'
    case 'Cancelled':
      return 'Projeto cancelado. Contribuições não são mais aceitas.'
    default:
      return null
  }
}

export function FundingPanel({ project, funding, loading, onFund }: FundingPanelProps) {
  const totalRaised = funding?.totalRaised ?? '0'
  const fundingPercentage = funding?.fundingPercentage ?? 0
  const notice = getFundingNotice(project)

  return (
    <Card glow="green" className="space-y-5">
      <div>
        <p className="font-mono text-xs uppercase text-green-300">financiamento</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-100">
          Progresso financeiro
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <StatCard label="Meta total" value={`${formatUsdc(project.totalAmount)} USDC`} />
        <StatCard
          label="Arrecadado"
          value={`${formatUsdc(totalRaised)} USDC`}
          tone="green"
        />
      </div>

      <ProgressBar
        value={Number(fundingPercentage.toFixed(2))}
        label="Financiado"
        tone="green"
      />

      {notice ? (
        <p className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs leading-5 text-slate-400">
          {notice}
        </p>
      ) : (
        <FundingForm loading={loading} onFund={onFund} />
      )}
    </Card>
  )
}
