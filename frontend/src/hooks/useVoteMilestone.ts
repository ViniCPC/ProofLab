import { useCallback, useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  type TransactionStatusState,
} from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { votingService } from '@/services/voting.service'
import { demoStore } from '@/store/demoStore'
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

function isVoteOpen(milestone: Milestone) {
  return (
    milestone.status === 'PENDING_REVIEW' || milestone.status === 'SUBMITTED'
  )
}

export function useVoteMilestone({
  projectId,
  milestones,
}: UseVoteMilestoneOptions) {
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
          'Nao foi possivel carregar os votos agora.',
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
        title: approve ? 'Registrando aprovacao' : 'Registrando rejeicao',
        message: milestone.onChainMilestoneAddress
          ? 'Seu voto on-chain esta sendo preparado.'
          : 'Seu voto esta sendo salvo na demo.',
      },
    }))

    const transactionId = demoStore.addTransaction({
      type: 'vote',
      status: 'pending',
      title: approve ? 'Voto de aprovacao' : 'Voto de rejeicao',
      message: milestone.onChainMilestoneAddress
        ? 'Preparando voto on-chain.'
        : 'Enviando voto para a DAO da demo.',
      projectId,
      milestoneId: milestone.id,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para votar.',
      )

      let signature: string | undefined

      if (milestone.onChainMilestoneAddress) {
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

        signature = await signAndSendTransaction(
          chainResponse.transaction,
          connection,
          sendTransaction,
        )
        const confirmation = await blockchainService.confirmTransaction(
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
              message: 'Aguardando confirmacao final do backend.',
              transaction: signature,
            },
          }))
          demoStore.updateTransaction(transactionId, {
            status: 'pending',
            message: 'Aguardando confirmacao final do backend.',
            transaction: signature,
          })
          return
        }
      } else {
        await votingService.vote(projectId, milestone.id, { approve })
      }

      const updatedVotes = await votingService.getByMilestone(
        projectId,
        milestone.id,
      )

      const message = milestone.onChainMilestoneAddress
        ? 'Voto confirmado on-chain.'
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
          transaction: signature,
        },
      }))

      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message,
        transaction: signature,
      })
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Nao foi possivel registrar o voto agora.',
      )

      setState((currentState) => ({
        ...currentState,
        loadingMilestoneId: null,
        error: errorMessage,
        transactionStatus: {
          status: 'failed',
          title: 'Voto nao registrado',
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
