import { FundingForm } from './FundingForm'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatCard } from '@/components/ui/StatCard'
import type { FundingStats } from '@/types'
import { formatUsdc } from '@/utils/format'

interface FundingPanelProps {
  funding: FundingStats | null
  totalAmount: string
  loading?: boolean
  onChainLoading?: boolean
  onFund: (amount: string) => Promise<void>
  onFundOnChain?: (amount: string) => Promise<void>
}

export function FundingPanel({
  funding,
  totalAmount,
  loading,
  onChainLoading,
  onFund,
  onFundOnChain,
}: FundingPanelProps) {
  const totalRaised = funding?.totalRaised ?? '0'
  const fundingPercentage = funding?.fundingPercentage ?? 0

  return (
    <Card glow="green" className="space-y-5">
      <div>
        <p className="font-mono text-xs uppercase text-green-300">funding</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-100">
          Progresso financeiro
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <StatCard label="Meta total" value={`${formatUsdc(totalAmount)} USDC`} />
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

      <FundingForm
        loading={loading}
        onChainLoading={onChainLoading}
        onFund={onFund}
        onFundOnChain={onFundOnChain}
      />
    </Card>
  )
}
