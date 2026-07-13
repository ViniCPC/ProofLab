import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  type TransactionStatusState,
} from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { demoStore } from '@/store/demoStore'
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

    demoStore.setSelectedProject(projectId)
    setLoading(true)
    setError(null)
    setTransactionStatus({
      status: 'pending',
      title: 'Preparando funding on-chain',
      message: 'A transação de contribuição está sendo montada.',
    })

    const transactionId = demoStore.addTransaction({
      type: 'fund-project',
      status: 'pending',
      title: 'Funding on-chain',
      message: 'Preparando transação de contribuição.',
      projectId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para contribuir on-chain.',
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
      const confirmation = await blockchainService.confirmTransaction(
        projectId,
        response.requestId,
        signature,
      )

      if (confirmation.status !== 'CONFIRMED') {
        setTransactionStatus({
          status: 'pending',
          title: 'Funding enviado',
          message: 'Aguardando confirmação final do backend.',
          transaction: signature,
        })
        demoStore.updateTransaction(transactionId, {
          status: 'pending',
          message: 'Aguardando confirmação final do backend.',
          transaction: signature,
        })
        return
      }

      await onFunded?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Funding confirmado',
        message: 'Transação on-chain confirmada.',
        transaction: signature,
      })
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Transação on-chain confirmada.',
        transaction: signature,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Não foi possível preparar o funding on-chain.',
      )

      setError(errorMessage)
      setTransactionStatus({
        status: 'failed',
        title: 'Funding on-chain falhou',
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
    fundOnChain,
    dismissTransactionStatus,
  }
}
