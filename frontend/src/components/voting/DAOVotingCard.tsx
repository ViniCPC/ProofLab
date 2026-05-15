import { Vote } from 'lucide-react'
import { MilestoneStatusBadge } from '@/components/milestones/MilestoneStatusBadge'
import { getMilestoneDisplayStatus } from '@/components/milestones/milestoneStatus'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Milestone, MilestoneVoteResult } from '@/types'
import { VoteButtons } from './VoteButtons'
import { VoteProgress } from './VoteProgress'
import { VotingEligibilityNotice } from './VotingEligibilityNotice'

interface DAOVotingCardProps {
  milestone: Milestone
  orderedMilestones: Milestone[]
  voteResult?: MilestoneVoteResult
  eligibleVoters: number
  connected: boolean
  isContributor: boolean
  isCreator: boolean
  loading?: boolean
  finalizeLoading?: boolean
  onVote: (milestone: Milestone, approve: boolean) => Promise<void>
  onFinalizeVote: (milestone: Milestone) => Promise<void>
}

const emptyVoteResult: MilestoneVoteResult = {
  votes: [],
  summary: {
    total: 0,
    approved: 0,
    rejected: 0,
  },
}

function isVotingOpen(milestone: Milestone) {
  return milestone.status === 'PENDING_REVIEW' || milestone.status === 'SUBMITTED'
}

export function DAOVotingCard({
  milestone,
  orderedMilestones,
  voteResult = emptyVoteResult,
  eligibleVoters,
  connected,
  isContributor,
  isCreator,
  loading,
  finalizeLoading,
  onVote,
  onFinalizeVote,
}: DAOVotingCardProps) {
  const displayStatus = getMilestoneDisplayStatus(milestone, orderedMilestones)
  const canVote =
    connected && isContributor && !isCreator && isVotingOpen(milestone)

  return (
    <Card glow="purple" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-200">
            <Vote className="size-5" />
            <h3 className="text-base font-semibold">Votação DAO</h3>
          </div>
          <p className="text-sm text-slate-400">
            Etapa {milestone.order}: {milestone.title}
          </p>
        </div>
        <MilestoneStatusBadge status={displayStatus} />
      </div>

      <VoteProgress
        summary={voteResult.summary}
        eligibleVoters={eligibleVoters}
      />

      <VotingEligibilityNotice
        connected={connected}
        isContributor={isContributor}
        isCreator={isCreator}
        canVote={canVote}
      />

      <VoteButtons
        loading={loading}
        disabled={!canVote}
        onVote={(approve) => onVote(milestone, approve)}
      />
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        loading={finalizeLoading}
        disabled={!connected || finalizeLoading}
        onClick={() => void onFinalizeVote(milestone)}
      >
        Finalizar votação on-chain
      </Button>
    </Card>
  )
}
