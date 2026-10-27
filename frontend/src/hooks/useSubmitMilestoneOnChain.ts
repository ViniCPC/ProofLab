import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { blockchainService } from '@/services/blockchain.service'
import { transactionStore } from '@/store/transactionStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession, signAndSendTransaction } from '@/utils/wallet'

interface UseSubmitMilestoneOnChainOptions {
  projectId?: string
  onPrepared?: () => Promise<void> | void
}

export function useSubmitMilestoneOnChain({
  projectId,
  onPrepared,
}: UseSubmitMilestoneOnChainOptions) {
  const { walletAddress } = useWalletStore()
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submitMilestoneOnChain(milestoneId: string) {
    if (!projectId) return

    transactionStore.setSelectedProject(projectId)
    transactionStore.setCurrentMilestone(milestoneId)
    setLoadingMilestoneId(milestoneId)
    setMessage(null)
    setError(null)

    const transactionId = transactionStore.addTransaction({
      type: 'submit-milestone',
      status: 'pending',
      title: 'Abrir votação',
      message: 'Abrindo a etapa para votação dos financiadores.',
      projectId,
      milestoneId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para abrir a votação.',
      )

      const votingDurationSeconds =
        Number.parseInt(import.meta.env.VITE_VOTING_DURATION_SECONDS ?? '', 10) ||
        60 * 60 * 24 * 3
      setMessage('Confirme a abertura da votação na sua wallet.')
      const response = await blockchainService.submitMilestoneOnChain(
        projectId,
        milestoneId,
        votingDurationSeconds,
      )
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
        setMessage('Transação enviada. Aguardando a confirmação da rede.')
        transactionStore.updateTransaction(transactionId, {
          status: 'pending',
          message: 'Aguardando a confirmação da rede.',
          transaction: signature,
        })
        return
      }

      await onPrepared?.()

      setMessage('Votação aberta. Os financiadores já podem votar nesta etapa.')
      transactionStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Votação aberta para os financiadores.',
        transaction: signature,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Não foi possível abrir a votação.',
      )

      setError(errorMessage)
      transactionStore.updateTransaction(transactionId, {
        status: 'failed',
        message: errorMessage,
      })
    } finally {
      setLoadingMilestoneId(null)
    }
  }

  return {
    loadingMilestoneId,
    message,
    error,
    submitMilestoneOnChain,
  }
}
