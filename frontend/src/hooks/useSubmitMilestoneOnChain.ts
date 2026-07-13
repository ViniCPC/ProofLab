import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { blockchainService } from '@/services/blockchain.service'
import { demoStore } from '@/store/demoStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession, signAndSendTransaction } from '@/utils/wallet'

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
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | null>(
    null,
  )
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function signAndConfirmPrepared(
    transaction: string,
    requestId: string,
  ) {
    if (!projectId) {
      throw new Error('Project is required')
    }

    const signature = await signAndSendTransaction(
      transaction,
      connection,
      sendTransaction,
    )
    const confirmation = await blockchainService.confirmTransaction(
      projectId,
      requestId,
      signature,
    )

    return { confirmation, signature }
  }

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
      message: 'Abrindo milestone para votacao on-chain.',
      projectId,
      milestoneId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para preparar a milestone on-chain.',
      )

      try {
        setMessage('Confirme a criacao da milestone na sua wallet.')
        const createResponse = await blockchainService.createMilestoneOnChain(
          projectId,
          milestoneId,
        )
        const createResult = await signAndConfirmPrepared(
          createResponse.transaction,
          createResponse.requestId,
        )

        if (createResult.confirmation.status !== 'CONFIRMED') {
          demoStore.updateTransaction(transactionId, {
            status: 'pending',
            message: 'Aguardando confirmacao da milestone.',
            transaction: createResult.signature,
          })
          return
        }
      } catch (caughtError) {
        if (!isAlreadyCreatedOnChain(caughtError)) {
          throw caughtError
        }
      }

      setMessage('Confirme a abertura de votacao na sua wallet.')
      const response = await blockchainService.submitMilestoneOnChain(
        projectId,
        milestoneId,
        60 * 60 * 24 * 3,
      )
      const result = await signAndConfirmPrepared(
        response.transaction,
        response.requestId,
      )

      if (result.confirmation.status !== 'CONFIRMED') {
        demoStore.updateTransaction(transactionId, {
          status: 'pending',
          message: 'Aguardando confirmacao final do backend.',
          transaction: result.signature,
        })
        return
      }

      await onPrepared?.()

      setMessage('Milestone preparada para votacao on-chain.')
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Milestone preparada para votacao on-chain.',
        transaction: result.signature,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Nao foi possivel preparar a milestone on-chain.',
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
