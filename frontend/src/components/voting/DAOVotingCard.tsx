import { useEffect, useState } from 'react'
import { Clock, Vote } from 'lucide-react'
import { MilestoneStatusBadge } from '@/components/milestones/MilestoneStatusBadge'
import {
  getMilestoneDisplayStatus,
  isVotingOpen,
} from '@/components/milestones/milestoneStatus'
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
    approvedWeight: '0',
    rejectedWeight: '0',
    votingEndsAt: null,
  },
}

function useNow(enabled: boolean) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!enabled) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [enabled])

  return now
}

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function DAOVotingCard({
  milestone,
  orderedMilestones,
  voteResult = emptyVoteResult,
  connected,
  isContributor,
  isCreator,
  loading,
  finalizeLoading,
  onVote,
  onFinalizeVote,
}: DAOVotingCardProps) {
  const endsAt = voteResult.summary.votingEndsAt
    ? new Date(voteResult.summary.votingEndsAt).getTime()
    : null
  const now = useNow(endsAt !== null)
  // The contract accepts votes until the deadline and finalization only after it.
  // If the deadline could not be read, both actions stay available.
  const deadlinePassed = endsAt !== null && now > endsAt
  const showVoting = endsAt === null || !deadlinePassed
  const showFinalize = endsAt === null || deadlinePassed
  const displayStatus = getMilestoneDisplayStatus(milestone, orderedMilestones)
  const canVote =
    connected && isContributor && !isCreator && isVotingOpen(milestone) && !deadlinePassed

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

      {endsAt !== null && (
        <p className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="size-3.5 text-purple-200" />
          {deadlinePassed
            ? 'Prazo encerrado. Qualquer pessoa pode registrar o resultado.'
            : `A votação fecha em ${formatRemaining(endsAt - now)}.`}
        </p>
      )}

      <VoteProgress summary={voteResult.summary} />

      {showVoting && (
        <>
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
        </>
      )}

      {showFinalize && (
        <Button
          type="button"
          variant={deadlinePassed ? 'primary' : 'secondary'}
          className="w-full"
          loading={finalizeLoading}
          disabled={!connected || finalizeLoading}
          onClick={() => void onFinalizeVote(milestone)}
        >
          Encerrar votação
        </Button>
      )}
    </Card>
  )
}
