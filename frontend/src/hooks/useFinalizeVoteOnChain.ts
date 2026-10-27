import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { type TransactionStatusState } from '@/components/blockchain/TransactionStatusToast'
import { blockchainService } from '@/services/blockchain.service'
import { transactionStore } from '@/store/transactionStore'
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
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function finalizeVoteOnChain(milestoneId: string) {
    if (!projectId) return

    transactionStore.setSelectedProject(projectId)
    transactionStore.setCurrentMilestone(milestoneId)
    setLoadingMilestoneId(milestoneId)
    setError(null)
    setTransactionStatus({
      status: 'pending',
      title: 'Encerrando votação',
      message: 'Montando a transação que encerra a votação.',
    })

    const transactionId = transactionStore.addTransaction({
      type: 'finalize-vote',
      status: 'pending',
      title: 'Encerramento da votação',
      message: 'Preparando a transação que encerra a votação.',
      projectId,
      milestoneId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para encerrar a votação.',
      )

      const response = await blockchainService.finalizeMilestoneVote(
        projectId,
        milestoneId,
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
          title: 'Encerramento enviado',
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

      await onFinalized?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Votação encerrada',
        message: 'O contrato registrou o resultado da votação.',
        transaction: signature,
      })
      transactionStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'O contrato registrou o resultado da votação.',
        transaction: signature,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Não foi possível encerrar a votação.',
      )

      setError(errorMessage)
      setTransactionStatus({
        status: 'failed',
        title: 'Encerramento não concluído',
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
    error,
    transactionStatus,
    finalizeVoteOnChain,
    dismissTransactionStatus,
  }
}
