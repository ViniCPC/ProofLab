import { ExternalLink } from 'lucide-react'
import { MilestoneAIReviewCard } from '@/components/ai/MilestoneAIReviewCard'
import { Button } from '@/components/ui/Button'
import type { Milestone } from '@/types'
import { formatUsdc } from '@/utils/format'
import { MilestoneStatusBadge } from './MilestoneStatusBadge'
import { getMilestoneDisplayStatus } from './milestoneStatus'
import { SubmitMilestoneDialog } from './SubmitMilestoneDialog'

interface MilestoneCardProps {
  milestone: Milestone
  orderedMilestones: Milestone[]
  loading?: boolean
  onSubmitReview: (
    milestoneId: string,
    payload: {
      submittedReport: string
      progress: number
      evidenceText: string
    },
  ) => Promise<void>
  onPrepareOnChain: (milestoneId: string) => Promise<void>
}

function canSubmitReview(status: ReturnType<typeof getMilestoneDisplayStatus>) {
  return status === 'CURRENT' || status === 'REJECTED'
}

function canPrepareOnChain(milestone: Milestone) {
  return milestone.status === 'APPROVED' && !milestone.onChainMilestoneAddress
}

export function MilestoneCard({
  milestone,
  orderedMilestones,
  loading,
  onSubmitReview,
  onPrepareOnChain,
}: MilestoneCardProps) {
  const displayStatus = getMilestoneDisplayStatus(milestone, orderedMilestones)

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-xs text-cyan-300">
            Etapa {milestone.order}
          </p>
          <h3 className="text-base font-semibold text-slate-100">
            {milestone.title}
          </h3>
          <p className="max-w-3xl text-sm leading-6 text-slate-500">
            {milestone.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <MilestoneStatusBadge status={displayStatus} />
          <span className="font-mono text-sm text-slate-200">
            {formatUsdc(milestone.amount)} USDC
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
        <MilestoneAIReviewCard milestone={milestone} />

        <div className="flex flex-wrap content-start gap-2">
          {canSubmitReview(displayStatus) && (
            <SubmitMilestoneDialog
              milestoneTitle={milestone.title}
              disabled={loading}
              onSubmit={(payload) => onSubmitReview(milestone.id, payload)}
            />
          )}
          {canPrepareOnChain(milestone) && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              loading={loading}
              onClick={() => void onPrepareOnChain(milestone.id)}
            >
              <ExternalLink className="size-3.5" />
              Preparar on-chain
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
