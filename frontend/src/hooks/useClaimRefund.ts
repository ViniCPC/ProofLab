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

interface UseClaimRefundOptions {
  projectId?: string
  onClaimed?: () => Promise<void> | void
}

const idleTransaction: TransactionStatusState = {
  status: 'idle',
  title: '',
}

export function useClaimRefund({ projectId, onClaimed }: UseClaimRefundOptions) {
  const { walletAddress } = useWalletStore()
  const { connection } = useConnection()
  const { sendTransaction, signMessage } = useWallet()
  const [loading, setLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusState>(idleTransaction)

  async function claimRefund() {
    if (!projectId) return

    demoStore.setSelectedProject(projectId)
    setLoading(true)
    setTransactionStatus({
      status: 'pending',
      title: 'Preparando refund',
      message: 'A transacao de reembolso esta sendo montada.',
    })

    const transactionId = demoStore.addTransaction({
      type: 'claim-refund',
      status: 'pending',
      title: 'Solicitacao de refund',
      message: 'Preparando transacao on-chain de reembolso.',
      projectId,
    })

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para solicitar refund.',
      )

      const response = await blockchainService.claimRefund(projectId)
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
          title: 'Refund enviado',
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

      await onClaimed?.()

      setTransactionStatus({
        status: 'confirmed',
        title: 'Refund confirmado',
        message: 'Reembolso confirmado on-chain.',
        transaction: signature,
      })
      demoStore.updateTransaction(transactionId, {
        status: 'confirmed',
        message: 'Reembolso confirmado on-chain.',
        transaction: signature,
      })
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Nao foi possivel preparar o reembolso.',
      )
      setTransactionStatus({
        status: 'failed',
        title: 'Refund falhou',
        message: errorMessage,
      })
      demoStore.updateTransaction(transactionId, {
        status: 'failed',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  function dismissTransactionStatus() {
    setTransactionStatus(idleTransaction)
  }

  return {
    loading,
    transactionStatus,
    claimRefund,
    dismissTransactionStatus,
  }
}
