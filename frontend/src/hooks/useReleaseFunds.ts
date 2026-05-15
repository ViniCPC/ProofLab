import { useState } from 'react'
import {
  type TransactionStatusState,
} from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { demoStore } from '@/store/demoStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession } from '@/utils/wallet'

interface UseReleaseFundsOptions {
  projectId?: string
  onReleased?: () => Promise<void> | void
}

const idleTransaction: TransactionStatusState = {
  status: 'idle',
  title: '',
}

export function useReleaseFunds({
  projectId,
  onReleased,
}: UseReleaseFundsOptions) {
  const { walletAddress } = useWalletStore()
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function releaseFunds(milestoneId: string) {
    if (!projectId) return

    demoStore.setSelectedProject(projectId)
    demoStore.setCurrentMilestone(milestoneId)
    setLoadingMilestoneId(milestoneId)
    setTransactionStatus({
      status: 'pending',
      title: 'Preparando liberação',
      message: 'A transação de release está sendo montada.',
    })

    const transactionId = demoStore.addTransaction({
      type: 'release-funds',
      status: 'pending',
      title: 'Liberação de fundos',
      message: 'Preparando transação on-chain de release.',
      projectId,
      milestoneId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        'Conecte sua wallet para liberar fundos.',
      )

      const response = await blockchainService.releaseFunds(
        projectId,
        milestoneId,
      )

      await onReleased?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Fundos prontos para liberação',
        message: 'Transação on-chain preparada para assinatura.',
        transaction: response.transaction,
      })
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Transação on-chain preparada para assinatura.',
        transaction: response.transaction,
      })
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Não foi possível preparar a liberação dos fundos.',
      )
      setTransactionStatus({
        status: 'failed',
        title: 'Release falhou',
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
    transactionStatus,
    releaseFunds,
    dismissTransactionStatus,
  }
}
