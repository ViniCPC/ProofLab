import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { blockchainService } from '@/services/blockchain.service'
import { demoStore } from '@/store/demoStore'
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

      setMessage(`Confirme a criação da milestone ${milestone.order} na wallet.`)
      const response = await blockchainService.createMilestoneOnChain(
        projectId!,
        milestone.id,
      )
      const result = await confirmPrepared(
        response.transaction,
        response.requestId,
      )

      if (result.confirmation.status !== 'CONFIRMED') {
        setMessage('Transação enviada. Aguardando confirmação da milestone.')
        demoStore.updateTransaction(transactionId, {
          status: 'pending',
          message: `Aguardando confirmação da milestone ${milestone.order}.`,
          transaction: result.signature,
        })
        return false
      }

      demoStore.updateTransaction(transactionId, {
        status: 'pending',
        message: `Milestone ${milestone.order} criada on-chain.`,
        transaction: result.signature,
      })
    }

    return true
  }

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
      message: 'Preparando projeto e milestones na Solana.',
      projectId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para criar o projeto on-chain.',
      )

      let projectRegistered = Boolean(onChainProjectAddress)

      if (!projectRegistered) {
        const response = await blockchainService.createProjectOnChain(projectId)
        setMessage('Confirme a criação do projeto na sua wallet.')
        const result = await confirmPrepared(
          response.transaction,
          response.requestId,
        )

        if (result.confirmation.status !== 'CONFIRMED') {
          setMessage('Transação enviada. Aguardando confirmação do projeto.')
          demoStore.updateTransaction(transactionId, {
            status: 'pending',
            message: 'Aguardando confirmação final do backend.',
            transaction: result.signature,
          })
          return
        }

        projectRegistered = true
        demoStore.updateTransaction(transactionId, {
          status: 'pending',
          message: 'Projeto registrado. Criando milestones on-chain.',
          transaction: result.signature,
        })
      }

      if (!projectRegistered || milestones.length === 0) {
        throw new Error('O projeto precisa ter milestones para receber funding.')
      }

      const milestonesCreated = await createMilestones(transactionId)
      if (!milestonesCreated) return

      await onPrepared?.()

      setMessage('Projeto e milestones registrados on-chain.')
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Projeto e milestones registrados on-chain.',
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
