import { Coins, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Milestone } from '@/types'
import { formatUsdc } from '@/utils/format'

interface ReleaseFundsPanelProps {
  milestones: Milestone[]
  loadingMilestoneId?: string | null
  onRelease: (milestoneId: string) => Promise<void>
}

function getApprovedMilestones(milestones: Milestone[]) {
  return milestones
    .filter((milestone) => milestone.status === 'APPROVED')
    .sort((first, second) => first.order - second.order)
}

export function ReleaseFundsPanel({
  milestones,
  loadingMilestoneId,
  onRelease,
}: ReleaseFundsPanelProps) {
  const approvedMilestones = getApprovedMilestones(milestones)

  if (approvedMilestones.length === 0) return null

  return (
    <Card glow="green" className="space-y-4">
      <div className="flex items-center gap-2 text-green-200">
        <Coins className="size-5" />
        <h2 className="text-lg font-semibold">Liberar fundos</h2>
      </div>

      <p className="text-sm leading-6 text-slate-400">
        Milestones aprovadas podem liberar a próxima tranche do escrow on-chain.
      </p>

      <div className="space-y-3">
        {approvedMilestones.map((milestone) => {
          const needsOnChainSubmit = !milestone.onChainMilestoneAddress
          const alreadyReleased = Boolean(milestone.releaseTransactionHash)
          const disabled = needsOnChainSubmit || alreadyReleased

          return (
            <div
              key={milestone.id}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
            >
              <div className="flex items-start justify-between gap-3">
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
                  variant="secondary"
                  loading={loadingMilestoneId === milestone.id}
                  disabled={disabled}
                  onClick={() => void onRelease(milestone.id)}
                >
                  <ExternalLink className="size-3.5" />
                  Liberar
                </Button>
              </div>
              {needsOnChainSubmit && (
                <p className="mt-2 text-xs text-slate-500">
                  Prepare a milestone on-chain antes do release.
                </p>
              )}
              {alreadyReleased && (
                <p className="mt-2 text-xs text-green-200">
                  Release já preparado para esta etapa.
                </p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
