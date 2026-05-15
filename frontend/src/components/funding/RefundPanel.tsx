import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useWalletStore } from '@/store/walletStore'
import type { FundingStats, ResearchProject } from '@/types'
import { formatUsdc, shortenAddress } from '@/utils/format'

interface RefundPanelProps {
  project: ResearchProject
  funding: FundingStats | null
  loading?: boolean
  onClaimRefund: () => Promise<void>
}

function isCancelled(project: ResearchProject) {
  return project.status === 'CANCELLED' || project.onChainStatus === 'Cancelled'
}

function getEstimatedRefund(funding: FundingStats | null, walletAddress: string | null) {
  if (!funding || !walletAddress) return 0

  return funding.investors
    .filter(
      (contribution) =>
        contribution.wallet === walletAddress ||
        contribution.funder.walletAddress === walletAddress,
    )
    .reduce((total, contribution) => total + Number(contribution.amount), 0)
}

export function RefundPanel({
  project,
  funding,
  loading,
  onClaimRefund,
}: RefundPanelProps) {
  const { walletAddress } = useWalletStore()

  if (!isCancelled(project)) return null

  const estimatedRefund = getEstimatedRefund(funding, walletAddress)
  const canClaim = Boolean(walletAddress && estimatedRefund > 0)

  return (
    <Card glow="purple" className="space-y-4">
      <div className="flex items-center gap-2 text-purple-200">
        <RotateCcw className="size-5" />
        <h2 className="text-lg font-semibold">Solicitar reembolso</h2>
      </div>

      <p className="text-sm leading-6 text-slate-400">
        Projeto cancelado. Doadores podem preparar a transação de refund.
      </p>

      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
        <p className="text-xs text-slate-500">Refund estimado</p>
        <p className="mt-1 font-mono text-lg text-slate-100">
          {formatUsdc(estimatedRefund)} USDC
        </p>
        {walletAddress && (
          <p className="mt-1 font-mono text-xs text-cyan-200">
            {shortenAddress(walletAddress, 6)}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="secondary"
        loading={loading}
        disabled={!canClaim}
        onClick={() => void onClaimRefund()}
      >
        <RotateCcw className="size-3.5" />
        Solicitar refund
      </Button>

      {!walletAddress && (
        <p className="text-xs text-slate-500">
          Conecte sua wallet para calcular seu reembolso.
        </p>
      )}
      {walletAddress && estimatedRefund <= 0 && (
        <p className="text-xs text-slate-500">
          Esta wallet não possui contribuição registrada neste projeto.
        </p>
      )}
    </Card>
  )
}
