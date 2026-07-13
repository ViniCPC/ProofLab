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
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | null>(
    null,
  )
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function releaseFunds(milestoneId: string) {
    if (!projectId) return

    demoStore.setSelectedProject(projectId)
    demoStore.setCurrentMilestone(milestoneId)
    setLoadingMilestoneId(milestoneId)
    setTransactionStatus({
      status: 'pending',
      title: 'Preparando liberacao',
      message: 'A transacao de release esta sendo montada.',
    })

    const transactionId = demoStore.addTransaction({
      type: 'release-funds',
      status: 'pending',
      title: 'Liberacao de fundos',
      message: 'Preparando transacao on-chain de release.',
      projectId,
      milestoneId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para liberar fundos.',
      )

      const response = await blockchainService.releaseFunds(
        projectId,
        milestoneId,
      )
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
          title: 'Release enviado',
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

      await onReleased?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Fundos liberados',
        message: 'Release confirmado on-chain.',
        transaction: signature,
      })
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Release confirmado on-chain.',
        transaction: signature,
      })
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Nao foi possivel preparar a liberacao dos fundos.',
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
