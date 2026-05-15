import { useState } from 'react'
import {
  type TransactionStatusState,
} from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { demoStore } from '@/store/demoStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession } from '@/utils/wallet'

interface UseClaimRefundOptions {
  projectId?: string
  onClaimed?: () => Promise<void> | void
}

const idleTransaction: TransactionStatusState = {
  status: 'idle',
  title: '',
}

export function useClaimRefund({ projectId, onClaimed }: UseClaimRefundOptions) {
  const { walletAddress } = useWalletStore()
  const [loading, setLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function claimRefund() {
    if (!projectId) return

    demoStore.setSelectedProject(projectId)
    setLoading(true)
    setTransactionStatus({
      status: 'pending',
      title: 'Preparando refund',
      message: 'A transação de reembolso está sendo montada.',
    })

    const transactionId = demoStore.addTransaction({
      type: 'claim-refund',
      status: 'pending',
      title: 'Solicitação de refund',
      message: 'Preparando transação on-chain de reembolso.',
      projectId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        'Conecte sua wallet para solicitar refund.',
      )

      const response = await blockchainService.claimRefund(projectId)
      await onClaimed?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Refund preparado',
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
        'Não foi possível preparar o reembolso.',
      )
      setTransactionStatus({
        status: 'failed',
        title: 'Refund falhou',
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
    transactionStatus,
    claimRefund,
    dismissTransactionStatus,
  }
}
