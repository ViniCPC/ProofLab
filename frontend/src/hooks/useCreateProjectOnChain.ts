import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { blockchainService } from '@/services/blockchain.service'
import { demoStore } from '@/store/demoStore'
import { useWalletStore } from '@/store/walletStore'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession, signAndSendTransaction } from '@/utils/wallet'

interface UseCreateProjectOnChainOptions {
  projectId?: string
  onPrepared?: () => Promise<void> | void
}

export function useCreateProjectOnChain({
  projectId,
  onPrepared,
}: UseCreateProjectOnChainOptions) {
  const { walletAddress } = useWalletStore()
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
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
      message: 'Preparando transacao do projeto na Solana.',
      projectId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para criar o projeto on-chain.',
      )

      const response = await blockchainService.createProjectOnChain(projectId)
      setMessage('Confirme a transacao na sua wallet.')

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
        setMessage('Transacao enviada. Aguardando confirmacao final.')
        demoStore.updateTransaction(transactionId, {
          status: 'pending',
          message: 'Aguardando confirmacao final do backend.',
          transaction: signature,
        })
        return
      }

      await onPrepared?.()

      setMessage('Projeto registrado on-chain.')
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Projeto registrado on-chain.',
        transaction: signature,
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Nao foi possivel preparar o projeto on-chain.',
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
