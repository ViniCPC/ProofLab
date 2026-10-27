import { useCallback, useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { type TransactionStatusState } from '@/components/blockchain/TransactionStatusToast'
import { isVotingOpen } from '@/components/milestones/milestoneStatus'
import { blockchainService } from '@/services/blockchain.service'
import { votingService } from '@/services/voting.service'
import { transactionStore } from '@/store/transactionStore'
import { useWalletStore } from '@/store/walletStore'
import type { Milestone, MilestoneVoteResult } from '@/types'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession, signAndSendTransaction } from '@/utils/wallet'

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

export function useVoteMilestone({ projectId, milestones }: UseVoteMilestoneOptions) {
  const { walletAddress } = useWalletStore()
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
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
        milestones.filter(isVotingOpen).map(async (milestone) => ({
          milestoneId: milestone.id,
          result: await votingService.getByMilestone(projectId, milestone.id),
        })),
      )

      setState((currentState) => ({
        ...currentState,
        error: null,
        votesByMilestoneId: voteResults.reduce<Record<string, MilestoneVoteResult>>(
          (acc, item) => {
            acc[item.milestoneId] = item.result
            return acc
          },
          {},
        ),
      }))
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        error: getApiErrorMessage(error, 'Não foi possível carregar os votos agora.'),
      }))
    }
  }, [milestones, projectId])

  async function submitVote(milestone: Milestone, approve: boolean) {
    if (!projectId) return

    transactionStore.setSelectedProject(projectId)
    transactionStore.setCurrentMilestone(milestone.id)

    setState((currentState) => ({
      ...currentState,
      loadingMilestoneId: milestone.id,
      error: null,
      transactionStatus: {
        status: 'pending',
        title: approve ? 'Registrando aprovação' : 'Registrando rejeição',
        message: 'Preparando seu voto.',
      },
    }))

    const transactionId = transactionStore.addTransaction({
      type: 'vote',
      status: 'pending',
      title: approve ? 'Voto de aprovação' : 'Voto de rejeição',
      message: 'Preparando seu voto.',
      projectId,
      milestoneId: milestone.id,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para votar.',
      )

      const chainResponse = await blockchainService.voteMilestoneOnChain(
        projectId,
        milestone.id,
        approve,
      )

      setState((currentState) => ({
        ...currentState,
        transactionStatus: {
          status: 'pending',
          title: 'Aguardando assinatura',
          message: 'Confirme o voto na sua wallet.',
        },
      }))

      const signature = await signAndSendTransaction(
        chainResponse.transaction,
        connection,
        sendTransaction,
      )
      const confirmation = await blockchainService.confirmTransactionWithRetry(
        projectId,
        chainResponse.requestId,
        signature,
      )

      if (confirmation.status !== 'CONFIRMED') {
        setState((currentState) => ({
          ...currentState,
          loadingMilestoneId: null,
          transactionStatus: {
            status: 'pending',
            title: 'Voto enviado',
            message: 'Aguardando a confirmação da rede.',
            transaction: signature,
          },
        }))
        transactionStore.updateTransaction(transactionId, {
          status: 'pending',
          message: 'Aguardando a confirmação da rede.',
          transaction: signature,
        })
        return
      }

      const updatedVotes = await votingService.getByMilestone(projectId, milestone.id)

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
          message: 'Seu voto foi registrado na Solana.',
          transaction: signature,
        },
      }))

      transactionStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Seu voto foi registrado na Solana.',
        transaction: signature,
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

      transactionStore.updateTransaction(transactionId, {
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
