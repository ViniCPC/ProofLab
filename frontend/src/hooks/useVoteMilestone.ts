import { useCallback, useEffect, useState } from 'react'
import {
  type TransactionStatusState,
} from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { votingService } from '@/services/voting.service'
import { demoStore } from '@/store/demoStore'
import { useWalletStore } from '@/store/walletStore'
import type { Milestone, MilestoneVoteResult } from '@/types'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession } from '@/utils/wallet'

interface UseVoteMilestoneOptions {
  projectId?: string
  milestones: Milestone[]
}

interface VoteMilestoneState {
  votesByMilestoneId: Record<string, MilestoneVoteResult>
  loadingMilestoneId: string | null
  error: string | null
  transactionStatus: TransactionStatusState
}

const idleTransaction: TransactionStatusState = {
  status: 'idle',
  title: '',
}

const initialState: VoteMilestoneState = {
  votesByMilestoneId: {},
  loadingMilestoneId: null,
  error: null,
  transactionStatus: idleTransaction,
}

function isVoteOpen(milestone: Milestone) {
  return milestone.status === 'PENDING_REVIEW' || milestone.status === 'SUBMITTED'
}

export function useVoteMilestone({
  projectId,
  milestones,
}: UseVoteMilestoneOptions) {
  const { walletAddress } = useWalletStore()
  const [state, setState] = useState<VoteMilestoneState>(initialState)

  const loadVotes = useCallback(async () => {
    if (!projectId || milestones.length === 0) {
      setState((currentState) => ({
        ...currentState,
        votesByMilestoneId: {},
      }))
      return
    }

    try {
      const voteResults = await Promise.all(
        milestones
          .filter(isVoteOpen)
          .map(async (milestone) => ({
            milestoneId: milestone.id,
            result: await votingService.getByMilestone(projectId, milestone.id),
          })),
      )

      setState((currentState) => ({
        ...currentState,
        error: null,
        votesByMilestoneId: voteResults.reduce<
          Record<string, MilestoneVoteResult>
        >((acc, item) => {
          acc[item.milestoneId] = item.result
          return acc
        }, {}),
      }))
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        error: getApiErrorMessage(
          error,
          'Não foi possível registrar o voto agora.',
        ),
      }))
    }
  }, [milestones, projectId])

  async function submitVote(milestone: Milestone, approve: boolean) {
    if (!projectId) return

    demoStore.setSelectedProject(projectId)
    demoStore.setCurrentMilestone(milestone.id)

    setState((currentState) => ({
      ...currentState,
      loadingMilestoneId: milestone.id,
      error: null,
      transactionStatus: {
        status: 'pending',
        title: approve ? 'Registrando aprovação' : 'Registrando rejeição',
        message: 'Seu voto está sendo enviado para a camada DAO.',
      },
    }))

    const transactionId = demoStore.addTransaction({
      type: 'vote',
      status: 'pending',
      title: approve ? 'Voto de aprovação' : 'Voto de rejeição',
      message: 'Enviando voto para a DAO da demo.',
      projectId,
      milestoneId: milestone.id,
    })

    try {
      await ensureWalletSession(walletAddress, 'Conecte sua wallet para votar.')
      await votingService.vote(projectId, milestone.id, { approve })

      const chainResponse = milestone.onChainMilestoneAddress
        ? await blockchainService.voteMilestoneOnChain(
            projectId,
            milestone.id,
            approve,
          )
        : null

      const updatedVotes = await votingService.getByMilestone(
        projectId,
        milestone.id,
      )

      const message = chainResponse
        ? 'Voto salvo e transação on-chain preparada.'
        : 'Voto salvo no backend da demo.'

      setState((currentState) => ({
        ...currentState,
        votesByMilestoneId: {
          ...currentState.votesByMilestoneId,
          [milestone.id]: updatedVotes,
        },
        loadingMilestoneId: null,
        transactionStatus: {
          status: 'confirmed',
          title: 'Voto registrado',
          message,
          transaction: chainResponse?.transaction,
        },
      }))

      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message,
        transaction: chainResponse?.transaction,
      })
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Não foi possível registrar o voto agora.',
      )

      setState((currentState) => ({
        ...currentState,
        loadingMilestoneId: null,
        error: errorMessage,
        transactionStatus: {
          status: 'failed',
          title: 'Voto não registrado',
          message: errorMessage,
        },
      }))

      demoStore.updateTransaction(transactionId, {
        status: 'failed',
        message: errorMessage,
      })
    }
  }

  function dismissTransactionStatus() {
    setState((currentState) => ({
      ...currentState,
      transactionStatus: idleTransaction,
    }))
  }

  useEffect(() => {
    queueMicrotask(() => void loadVotes())
  }, [loadVotes])

  return {
    ...state,
    submitVote,
    refetchVotes: loadVotes,
    dismissTransactionStatus,
  }
}
