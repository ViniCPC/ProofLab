import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { type TransactionStatusState } from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { transactionStore } from '@/store/transactionStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession, signAndSendTransaction } from '@/utils/wallet'

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
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function cancelProjectOnChain() {
    if (!projectId) return

    transactionStore.setSelectedProject(projectId)
    setLoading(true)
    setError(null)
    setTransactionStatus({
      status: 'pending',
      title: 'Cancelando projeto',
      message: 'Montando a transação de cancelamento.',
    })

    const transactionId = transactionStore.addTransaction({
      type: 'cancel-project',
      status: 'pending',
      title: 'Cancelamento do projeto',
      message: 'Preparando a transação de cancelamento.',
      projectId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para cancelar o projeto.',
      )

      const response = await blockchainService.cancelProjectOnChain(projectId)
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
          title: 'Cancelamento enviado',
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

      await onCancelled?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Projeto cancelado',
        message: 'O projeto foi cancelado e o reembolso está disponível.',
        transaction: signature,
      })
      transactionStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'O projeto foi cancelado e o reembolso está disponível.',
        transaction: signature,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Não foi possível cancelar o projeto.',
      )

      setError(errorMessage)
      setTransactionStatus({
        status: 'failed',
        title: 'Cancelamento não concluído',
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
    error,
    transactionStatus,
    cancelProjectOnChain,
    dismissTransactionStatus,
  }
}
