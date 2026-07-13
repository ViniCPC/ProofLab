import type { Connection } from '@solana/web3.js'
import { VersionedTransaction } from '@solana/web3.js'
import { authService } from '@/services/auth.service'
import { walletStore } from '@/store/walletStore'

export type SignMessage = (message: Uint8Array) => Promise<Uint8Array>

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export async function signInWithWallet(
  walletAddress: string,
  signMessage: SignMessage,
) {
  const { message } = await authService.requestNonce(walletAddress)
  const signature = await signMessage(new TextEncoder().encode(message))
  const { accessToken, user } = await authService.walletLogin(
    walletAddress,
    bytesToBase64(signature),
  )
  localStorage.setItem('prooflab_token', accessToken)
  walletStore.setUser(user)
}

export async function ensureWalletSession(
  walletAddress: string | null,
  signMessage: SignMessage | undefined,
  fallbackMessage: string,
) {
  if (!walletAddress) {
    throw new Error(fallbackMessage)
  }

  if (localStorage.getItem('prooflab_token')) return

  if (!signMessage) {
    throw new Error('Sua wallet não suporta assinatura de mensagens.')
  }

  await signInWithWallet(walletAddress, signMessage)
}

type SendTransaction = (
  transaction: VersionedTransaction,
  connection: Connection,
) => Promise<string>

export async function signAndSendTransaction(
  base64Transaction: string,
  connection: Connection,
  sendTransaction: SendTransaction,
): Promise<string> {
  const transaction = VersionedTransaction.deserialize(
    base64ToBytes(base64Transaction),
  )

  const signature = await sendTransaction(transaction, connection)
  await connection.confirmTransaction(signature, 'confirmed')

  return signature
}
