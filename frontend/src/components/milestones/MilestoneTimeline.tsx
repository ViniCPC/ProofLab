import { Card } from '@/components/ui/Card'
import type { Milestone } from '@/types'
import { MilestoneCard } from './MilestoneCard'

interface MilestoneTimelineProps {
  milestones: Milestone[]
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

function sortMilestones(milestones: Milestone[]) {
  return [...milestones].sort((first, second) => first.order - second.order)
}

export function MilestoneTimeline({
  milestones,
  loading,
  onSubmitReview,
  onPrepareOnChain,
}: MilestoneTimelineProps) {
  const orderedMilestones = sortMilestones(milestones)

  return (
    <Card glow="cyan" className="space-y-5">
      <div>
        <p className="font-mono text-xs uppercase text-cyan-300">timeline</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-100">
          Andamento das milestones
        </h2>
      </div>

      {orderedMilestones.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nenhuma milestone cadastrada para esta pesquisa.
        </p>
      ) : (
        <div className="space-y-4">
          {orderedMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              orderedMilestones={orderedMilestones}
              loading={loading}
              onSubmitReview={onSubmitReview}
              onPrepareOnChain={onPrepareOnChain}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
