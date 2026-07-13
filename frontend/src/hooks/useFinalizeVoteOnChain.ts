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

interface UseFinalizeVoteOnChainOptions {
  projectId?: string
  onFinalized?: () => Promise<void> | void
}

const idleTransaction: TransactionStatusState = {
  status: 'idle',
  title: '',
}

export function useFinalizeVoteOnChain({
  projectId,
  onFinalized,
}: UseFinalizeVoteOnChainOptions) {
  const { walletAddress } = useWalletStore()
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function finalizeVoteOnChain(milestoneId: string) {
    if (!projectId) return

    demoStore.setSelectedProject(projectId)
    demoStore.setCurrentMilestone(milestoneId)
    setLoadingMilestoneId(milestoneId)
    setError(null)
    setTransactionStatus({
      status: 'pending',
      title: 'Finalizando votacao',
      message: 'A transacao de fechamento da votacao esta sendo montada.',
    })

    const transactionId = demoStore.addTransaction({
      type: 'finalize-vote',
      status: 'pending',
      title: 'Finalizacao de votacao',
      message: 'Preparando transacao on-chain de finalize.',
      projectId,
      milestoneId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para finalizar a votacao.',
      )

      const response = await blockchainService.finalizeMilestoneVote(
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
          title: 'Finalizacao enviada',
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

      await onFinalized?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Votacao finalizada',
        message: 'Finalizacao confirmada on-chain.',
        transaction: signature,
      })
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Finalizacao confirmada on-chain.',
        transaction: signature,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Nao foi possivel finalizar a votacao on-chain.',
      )

      setError(errorMessage)
      setTransactionStatus({
        status: 'failed',
        title: 'Finalizacao falhou',
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
    error,
    transactionStatus,
    finalizeVoteOnChain,
    dismissTransactionStatus,
  }
}
