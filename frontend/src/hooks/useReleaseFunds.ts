import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { type TransactionStatusState } from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { transactionStore } from '@/store/transactionStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession, signAndSendTransaction } from '@/utils/wallet'

interface UseReleaseFundsOptions {
  projectId?: string
  onReleased?: () => Promise<void> | void
}

const idleTransaction: TransactionStatusState = {
  status: 'idle',
  title: '',
}

export function useReleaseFunds({ projectId, onReleased }: UseReleaseFundsOptions) {
  const { walletAddress } = useWalletStore()
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function releaseFunds(milestoneId: string) {
    if (!projectId) return

    transactionStore.setSelectedProject(projectId)
    transactionStore.setCurrentMilestone(milestoneId)
    setLoadingMilestoneId(milestoneId)
    setTransactionStatus({
      status: 'pending',
      title: 'Preparando liberação',
      message: 'Montando a transação de liberação.',
    })

    const transactionId = transactionStore.addTransaction({
      type: 'release-funds',
      status: 'pending',
      title: 'Liberação de fundos',
      message: 'Preparando a transação de liberação.',
      projectId,
      milestoneId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para liberar fundos.',
      )

      const response = await blockchainService.releaseFunds(projectId, milestoneId)
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
          title: 'Liberação enviada',
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

      await onReleased?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Fundos liberados',
        message: 'O valor da etapa foi transferido para a sua wallet.',
        transaction: signature,
      })
      transactionStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'O valor da etapa foi transferido para a sua wallet.',
        transaction: signature,
      })
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Não foi possível liberar os fundos.',
      )
      setTransactionStatus({
        status: 'failed',
        title: 'Liberação não concluída',
        message: errorMessage,
      })
      transactionStore.updateTransaction(transactionId, {
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
