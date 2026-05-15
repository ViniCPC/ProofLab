import { useState } from 'react'
import { blockchainService } from '@/services/blockchain.service'
import { demoStore } from '@/store/demoStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession } from '@/utils/wallet'

interface UseSubmitMilestoneOnChainOptions {
  projectId?: string
  onPrepared?: () => Promise<void> | void
}

function isAlreadyCreatedOnChain(error: unknown) {
  return getApiErrorMessage(error, '').toLowerCase().includes('already created')
}

export function useSubmitMilestoneOnChain({
  projectId,
  onPrepared,
}: UseSubmitMilestoneOnChainOptions) {
  const { walletAddress } = useWalletStore()
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submitMilestoneOnChain(milestoneId: string) {
    if (!projectId) return

    demoStore.setSelectedProject(projectId)
    demoStore.setCurrentMilestone(milestoneId)
    setLoadingMilestoneId(milestoneId)
    setMessage(null)
    setError(null)

    const transactionId = demoStore.addTransaction({
      type: 'submit-milestone',
      status: 'pending',
      title: 'Preparar milestone on-chain',
      message: 'Abrindo milestone para votação on-chain.',
      projectId,
      milestoneId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        'Conecte sua wallet para preparar a milestone on-chain.',
      )

      try {
        await blockchainService.createMilestoneOnChain(projectId, milestoneId)
      } catch (caughtError) {
        if (!isAlreadyCreatedOnChain(caughtError)) {
          throw caughtError
        }
      }

      const response = await blockchainService.submitMilestoneOnChain(
        projectId,
        milestoneId,
        60 * 60 * 24 * 3,
      )
      await onPrepared?.()

      setMessage('Milestone preparada para votação on-chain.')
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Milestone preparada para votação on-chain.',
        transaction: response.transaction,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Não foi possível preparar a milestone on-chain.',
      )

      setError(errorMessage)
      demoStore.updateTransaction(transactionId, {
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
