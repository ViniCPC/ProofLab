import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { blockchainService } from '@/services/blockchain.service'
import { transactionStore } from '@/store/transactionStore'
import { useWalletStore } from '@/store/walletStore'
import type { Milestone } from '@/types'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession, signAndSendTransaction } from '@/utils/wallet'

interface UseCreateProjectOnChainOptions {
  projectId?: string
  onChainProjectAddress?: string | null
  milestones?: Milestone[]
  onPrepared?: () => Promise<void> | void
}

export function useCreateProjectOnChain({
  projectId,
  onChainProjectAddress,
  milestones = [],
  onPrepared,
}: UseCreateProjectOnChainOptions) {
  const { walletAddress } = useWalletStore()
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function confirmPrepared(transaction: string, requestId: string) {
    if (!projectId) {
      throw new Error('Project is required')
    }

    const signature = await signAndSendTransaction(
      transaction,
      connection,
      sendTransaction,
    )
    const confirmation = await blockchainService.confirmTransactionWithRetry(
      projectId,
      requestId,
      signature,
    )

    return { confirmation, signature }
  }

  async function createMilestones(transactionId: string) {
    for (const milestone of milestones) {
      if (milestone.onChainMilestoneAddress) continue

      setMessage(`Confirme o registro da etapa ${milestone.order} na wallet.`)
      const response = await blockchainService.createMilestoneOnChain(
        projectId!,
        milestone.id,
      )
      const result = await confirmPrepared(response.transaction, response.requestId)

      if (result.confirmation.status !== 'CONFIRMED') {
        setMessage('Transação enviada. Aguardando a confirmação da etapa.')
        transactionStore.updateTransaction(transactionId, {
          status: 'pending',
          message: `Aguardando a confirmação da etapa ${milestone.order}.`,
          transaction: result.signature,
        })
        return false
      }

      transactionStore.updateTransaction(transactionId, {
        status: 'pending',
        message: `Etapa ${milestone.order} registrada na Solana.`,
        transaction: result.signature,
      })
    }

    return true
  }

  async function createOnChain() {
    if (!projectId) return

    transactionStore.setSelectedProject(projectId)
    setLoading(true)
    setMessage(null)
    setError(null)

    const transactionId = transactionStore.addTransaction({
      type: 'create-project',
      status: 'pending',
      title: 'Registrar projeto',
      message: 'Preparando o registro do projeto e das etapas na Solana.',
      projectId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para registrar o projeto.',
      )

      let projectRegistered = Boolean(onChainProjectAddress)

      if (!projectRegistered) {
        const response = await blockchainService.createProjectOnChain(projectId)
        setMessage('Confirme a criação do projeto na sua wallet.')
        const result = await confirmPrepared(response.transaction, response.requestId)

        if (result.confirmation.status !== 'CONFIRMED') {
          setMessage('Transação enviada. Aguardando confirmação do projeto.')
          transactionStore.updateTransaction(transactionId, {
            status: 'pending',
            message: 'Aguardando a confirmação da rede.',
            transaction: result.signature,
          })
          return
        }

        projectRegistered = true
        transactionStore.updateTransaction(transactionId, {
          status: 'pending',
          message: 'Projeto registrado. Registrando as etapas.',
          transaction: result.signature,
        })
      }

      if (!projectRegistered || milestones.length === 0) {
        throw new Error('O projeto precisa ter etapas para receber contribuições.')
      }

      const milestonesCreated = await createMilestones(transactionId)
      if (!milestonesCreated) return

      await onPrepared?.()

      setMessage('Projeto e etapas registrados na Solana. As contribuições estão abertas.')
      transactionStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Projeto e etapas registrados na Solana.',
      })
    } catch (caughtError) {
      const errorMessage = getApiErrorMessage(
        caughtError,
        'Não foi possível registrar o projeto.',
      )

      setError(errorMessage)
      transactionStore.updateTransaction(transactionId, {
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
