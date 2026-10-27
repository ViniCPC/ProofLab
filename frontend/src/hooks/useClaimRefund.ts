import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { type TransactionStatusState } from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { transactionStore } from '@/store/transactionStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession, signAndSendTransaction } from '@/utils/wallet'

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
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
  const [loading, setLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function claimRefund() {
    if (!projectId) return

    transactionStore.setSelectedProject(projectId)
    setLoading(true)
    setTransactionStatus({
      status: 'pending',
      title: 'Preparando reembolso',
      message: 'Montando a transação de reembolso.',
    })

    const transactionId = transactionStore.addTransaction({
      type: 'claim-refund',
      status: 'pending',
      title: 'Solicitação de reembolso',
      message: 'Preparando a transação de reembolso.',
      projectId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para solicitar o reembolso.',
      )

      const response = await blockchainService.claimRefund(projectId)
      setTransactionStatus({
        status: 'pending',
        title: 'Aguardando assinatura',
        message: 'Confirme a transação na sua wallet.',
      })

      const signature = await signAndSendTransaction(
        response.transaction,
        connection,
        sendTransaction,
      )
      const confirmation = await blockchainService.confirmTransactionWithRetry(
        projectId,
        response.requestId,
        signature,
      )

      if (confirmation.status !== 'CONFIRMED') {
        setTransactionStatus({
          status: 'pending',
          title: 'Reembolso enviado',
          message: 'Aguardando a confirmação da rede.',
          transaction: signature,
        })
        transactionStore.updateTransaction(transactionId, {
          status: 'pending',
          message: 'Aguardando a confirmação da rede.',
          transaction: signature,
        })
        return
      }

      await onClaimed?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Reembolso confirmado',
        message: 'O valor voltou para a sua wallet.',
        transaction: signature,
      })
      transactionStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'O valor voltou para a sua wallet.',
        transaction: signature,
      })
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Não foi possível solicitar o reembolso.',
      )
      setTransactionStatus({
        status: 'failed',
        title: 'Reembolso não concluído',
        message: errorMessage,
      })
      transactionStore.updateTransaction(transactionId, {
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
