import { useState } from 'react'
import { blockchainService } from '@/services/blockchain.service'
import { demoStore } from '@/store/demoStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession } from '@/utils/wallet'

interface UseCreateProjectOnChainOptions {
  projectId?: string
  onPrepared?: () => Promise<void> | void
}

export function useCreateProjectOnChain({
  projectId,
  onPrepared,
}: UseCreateProjectOnChainOptions) {
  const { walletAddress } = useWalletStore()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function createOnChain() {
    if (!projectId) return

    demoStore.setSelectedProject(projectId)
    setLoading(true)
    setMessage(null)
    setError(null)

    const transactionId = demoStore.addTransaction({
      type: 'create-project',
      status: 'pending',
      title: 'Criar projeto on-chain',
      message: 'Preparando transação do projeto na Solana.',
      projectId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        'Conecte sua wallet para criar o projeto on-chain.',
      )

      const response = await blockchainService.createProjectOnChain(projectId)
      await onPrepared?.()

      setMessage('Transação on-chain preparada para assinatura.')
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Transação do projeto preparada para assinatura.',
        transaction: response.transaction,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Não foi possível preparar o projeto on-chain.',
      )

      setError(errorMessage)
      demoStore.updateTransaction(transactionId, {
        status: 'failed',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    message,
    error,
    createOnChain,
  }
}
