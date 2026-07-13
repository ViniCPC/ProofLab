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

    demoStore.setSelectedProject(projectId)
    setLoading(true)
    setError(null)
    setTransactionStatus({
      status: 'pending',
      title: 'Cancelando projeto',
      message: 'A transacao de cancelamento esta sendo montada.',
    })

    const transactionId = demoStore.addTransaction({
      type: 'cancel-project',
      status: 'pending',
      title: 'Cancelamento on-chain',
      message: 'Preparando transacao de cancelamento.',
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
        message: 'Confirme a transacao na sua wallet.',
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
          title: 'Cancelamento enviado',
          message: 'Aguardando confirmacao final do backend.',
          transaction: signature,
        })
        demoStore.updateTransaction(transactionId, {
          status: 'pending',
          message: 'Aguardando confirmacao final do backend.',
          transaction: signature,
        })
        return
      }

      await onCancelled?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Projeto cancelado',
        message: 'Cancelamento confirmado on-chain.',
        transaction: signature,
      })
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Cancelamento confirmado on-chain.',
        transaction: signature,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Nao foi possivel cancelar o projeto on-chain.',
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
