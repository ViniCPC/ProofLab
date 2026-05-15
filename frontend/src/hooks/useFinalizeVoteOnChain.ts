import { useState } from 'react'
import {
  type TransactionStatusState,
} from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { demoStore } from '@/store/demoStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession } from '@/utils/wallet'

interface UseFinalizeVoteOnChainOptions {
  projectId?: string
  onFinalized?: () => Promise<void> | void
}

const idleTransaction: TransactionStatusState = {
  status: 'idle',
  title: '',
}

export function useFinalizeVoteOnChain({
  projectId,
  onFinalized,
}: UseFinalizeVoteOnChainOptions) {
  const { walletAddress } = useWalletStore()
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function finalizeVoteOnChain(milestoneId: string) {
    if (!projectId) return

    demoStore.setSelectedProject(projectId)
    demoStore.setCurrentMilestone(milestoneId)
    setLoadingMilestoneId(milestoneId)
    setError(null)
    setTransactionStatus({
      status: 'pending',
      title: 'Finalizando votação',
      message: 'A transação de fechamento da votação está sendo montada.',
    })

    const transactionId = demoStore.addTransaction({
      type: 'finalize-vote',
      status: 'pending',
      title: 'Finalização de votação',
      message: 'Preparando transação on-chain de finalize.',
      projectId,
      milestoneId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        'Conecte sua wallet para finalizar a votação.',
      )

      const response = await blockchainService.finalizeMilestoneVote(
        projectId,
        milestoneId,
      )
      await onFinalized?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Votação pronta para finalizar',
        message: 'Transação on-chain preparada para assinatura.',
        transaction: response.transaction,
      })
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Transação on-chain preparada para assinatura.',
        transaction: response.transaction,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Não foi possível finalizar a votação on-chain.',
      )

      setError(errorMessage)
      setTransactionStatus({
        status: 'failed',
        title: 'Finalização falhou',
        message: errorMessage,
      })
      demoStore.updateTransaction(transactionId, {
        status: 'failed',
        message: errorMessage,
      })
    } finally {
      setLoadingMilestoneId(null)
    }
  }

  function dismissTransactionStatus() {
    setTransactionStatus(idleTransaction)
  }

  return {
    loadingMilestoneId,
    error,
    transactionStatus,
    finalizeVoteOnChain,
    dismissTransactionStatus,
  }
}
