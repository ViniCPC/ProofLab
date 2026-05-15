import { useMemo } from 'react'
import { Vote } from 'lucide-react'
import { TransactionStatusToast } from '@/components/blockchain/TransactionStatusToast'
import { Card } from '@/components/ui/Card'
import { useFinalizeVoteOnChain } from '@/hooks/useFinalizeVoteOnChain'
import { useVoteMilestone } from '@/hooks/useVoteMilestone'
import { useWalletStore } from '@/store/walletStore'
import type { FundingStats, Milestone, ResearchProject } from '@/types'
import { DAOVotingCard } from './DAOVotingCard'

interface VotingPanelProps {
  project: ResearchProject
  milestones: Milestone[]
  funding: FundingStats | null
  onFinalized?: () => Promise<void> | void
}

function isVotingMilestone(milestone: Milestone) {
  return milestone.status === 'PENDING_REVIEW' || milestone.status === 'SUBMITTED'
}

function getWalletIsContributor(
  funding: FundingStats | null,
  walletAddress: string | null,
) {
  if (!funding || !walletAddress) return false

  return funding.investors.some(
    (contribution) =>
      contribution.wallet === walletAddress ||
      contribution.funder.walletAddress === walletAddress,
  )
}

function getWalletIsCreator(
  project: ResearchProject,
  walletAddress: string | null,
) {
  if (!walletAddress || !project.creator?.walletAddress) return false
  return project.creator.walletAddress === walletAddress
}

export function VotingPanel({
  project,
  milestones,
  funding,
  onFinalized,
}: VotingPanelProps) {
  const { walletAddress, connectionStatus } = useWalletStore()
  const connected = connectionStatus === 'connected'
  const votingMilestones = useMemo(
    () => milestones.filter(isVotingMilestone),
    [milestones],
  )
  const orderedMilestones = useMemo(
    () => [...milestones].sort((first, second) => first.order - second.order),
    [milestones],
  )
  const {
    votesByMilestoneId,
    loadingMilestoneId,
    error,
    transactionStatus,
    submitVote,
    dismissTransactionStatus,
  } = useVoteMilestone({
    projectId: project.id,
    milestones: votingMilestones,
  })
  const {
    loadingMilestoneId: finalizeLoadingMilestoneId,
    error: finalizeError,
    transactionStatus: finalizeTransactionStatus,
    finalizeVoteOnChain,
    dismissTransactionStatus: dismissFinalizeTransactionStatus,
  } = useFinalizeVoteOnChain({
    projectId: project.id,
    onFinalized,
  })
  const isContributor = getWalletIsContributor(funding, walletAddress)
  const isCreator = getWalletIsCreator(project, walletAddress)
  const eligibleVoters = funding?.investors.length ?? 0
  const finalizeToastIsActive = finalizeTransactionStatus.status !== 'idle'

  if (votingMilestones.length === 0) {
    return (
      <Card glow="purple" className="space-y-3">
        <div className="flex items-center gap-2 text-purple-200">
          <Vote className="size-5" />
          <h2 className="text-lg font-semibold">Votação DAO</h2>
        </div>
        <p className="text-sm leading-6 text-slate-400">
          Nenhuma milestone está em votação no momento.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {(error || finalizeError) && (
        <Card glow="purple">
          <p className="text-sm text-purple-100">{error ?? finalizeError}</p>
        </Card>
      )}

      {votingMilestones.map((milestone) => (
        <DAOVotingCard
          key={milestone.id}
          milestone={milestone}
          orderedMilestones={orderedMilestones}
          voteResult={votesByMilestoneId[milestone.id]}
          eligibleVoters={eligibleVoters}
          connected={connected}
          isContributor={isContributor}
          isCreator={isCreator}
          loading={loadingMilestoneId === milestone.id}
          finalizeLoading={finalizeLoadingMilestoneId === milestone.id}
          onVote={submitVote}
          onFinalizeVote={(selectedMilestone) =>
            finalizeVoteOnChain(selectedMilestone.id)
          }
        />
      ))}

      <TransactionStatusToast
        state={
          finalizeToastIsActive ? finalizeTransactionStatus : transactionStatus
        }
        onDismiss={
          finalizeToastIsActive
            ? dismissFinalizeTransactionStatus
            : dismissTransactionStatus
        }
      />
    </div>
  )
}
