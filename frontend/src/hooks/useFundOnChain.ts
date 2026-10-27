import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { type TransactionStatusState } from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { transactionStore } from '@/store/transactionStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession, signAndSendTransaction } from '@/utils/wallet'

interface UseFundOnChainOptions {
  projectId?: string
  onFunded?: () => Promise<void> | void
}

const idleTransaction: TransactionStatusState = {
  status: 'idle',
  title: '',
}

export function useFundOnChain({ projectId, onFunded }: UseFundOnChainOptions) {
  const { walletAddress } = useWalletStore()
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function fundOnChain(amount: string) {
    if (!projectId) return

    transactionStore.setSelectedProject(projectId)
    setLoading(true)
    setError(null)
    setTransactionStatus({
      status: 'pending',
      title: 'Preparando contribuição',
      message: 'Montando a transação de contribuição.',
    })

    const transactionId = transactionStore.addTransaction({
      type: 'fund-project',
      status: 'pending',
      title: 'Contribuição',
      message: 'Preparando a transação de contribuição.',
      projectId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para contribuir.',
      )

      const response = await blockchainService.fundProjectOnChain(
        projectId,
        Number(amount),
      )

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
          title: 'Contribuição enviada',
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

      await onFunded?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Contribuição confirmada',
        message: 'O valor está no escrow do projeto.',
        transaction: signature,
      })
      transactionStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'O valor está no escrow do projeto.',
        transaction: signature,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Não foi possível concluir a contribuição.',
      )

      setError(errorMessage)
      setTransactionStatus({
        status: 'failed',
        title: 'Contribuição não concluída',
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
    fundOnChain,
    dismissTransactionStatus,
  }
}
