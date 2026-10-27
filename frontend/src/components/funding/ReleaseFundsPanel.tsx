import { Coins } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Milestone } from '@/types'
import { formatUsdc } from '@/utils/format'

interface ReleaseFundsPanelProps {
  milestones: Milestone[]
  loadingMilestoneId?: string | null
  onRelease: (milestoneId: string) => Promise<void>
}

function getReleasableMilestones(milestones: Milestone[]) {
  return milestones
    .filter(
      (milestone) =>
        milestone.status === 'APPROVED' &&
        milestone.onChainMilestoneAddress &&
        !milestone.releaseTransactionHash,
    )
    .sort((first, second) => first.order - second.order)
}

export function ReleaseFundsPanel({
  milestones,
  loadingMilestoneId,
  onRelease,
}: ReleaseFundsPanelProps) {
  const releasableMilestones = getReleasableMilestones(milestones)

  if (releasableMilestones.length === 0) return null

  return (
    <Card glow="green" className="space-y-4">
      <div className="flex items-center gap-2 text-green-200">
        <Coins className="size-5" />
        <h2 className="text-lg font-semibold">Liberar fundos</h2>
      </div>

      <p className="text-sm leading-6 text-slate-400">
        A comunidade aprovou a etapa. O contrato transfere o valor dela do escrow
        para a sua wallet.
      </p>

      <div className="space-y-3">
        {releasableMilestones.map((milestone) => (
          <div
            key={milestone.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-100">
                Etapa {milestone.order}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatUsdc(milestone.amount)} USDC
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              loading={loadingMilestoneId === milestone.id}
              onClick={() => void onRelease(milestone.id)}
            >
              <Coins className="size-3.5" />
              Liberar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
