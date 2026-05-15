import { useState } from 'react'
import {
  type TransactionStatusState,
} from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { demoStore } from '@/store/demoStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession } from '@/utils/wallet'

interface UseCancelProjectOnChainOptions {
  projectId?: string
  onCancelled?: () => Promise<void> | void
}

const idleTransaction: TransactionStatusState = {
  status: 'idle',
  title: '',
}

export function useCancelProjectOnChain({
  projectId,
  onCancelled,
}: UseCancelProjectOnChainOptions) {
  const { walletAddress } = useWalletStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function cancelProjectOnChain() {
    if (!projectId) return

    demoStore.setSelectedProject(projectId)
    setLoading(true)
    setError(null)
    setTransactionStatus({
      status: 'pending',
      title: 'Cancelando projeto',
      message: 'A transação de cancelamento está sendo montada.',
    })

    const transactionId = demoStore.addTransaction({
      type: 'cancel-project',
      status: 'pending',
      title: 'Cancelamento on-chain',
      message: 'Preparando transação de cancelamento.',
      projectId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        'Conecte sua wallet para cancelar o projeto.',
      )

      const response = await blockchainService.cancelProjectOnChain(projectId)
      await onCancelled?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Cancelamento preparado',
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
        'Não foi possível cancelar o projeto on-chain.',
      )

      setError(errorMessage)
      setTransactionStatus({
        status: 'failed',
        title: 'Cancelamento falhou',
        message: errorMessage,
      })
      demoStore.updateTransaction(transactionId, {
        status: 'failed',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  function dismissTransactionStatus() {
    setTransactionStatus(idleTransaction)
  }

  return {
    loading,
    error,
    transactionStatus,
    cancelProjectOnChain,
    dismissTransactionStatus,
  }
}
