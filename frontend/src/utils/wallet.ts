import { authService } from '@/services/auth.service'
import { walletStore } from '@/store/walletStore'

export async function ensureWalletSession(
  walletAddress: string | null,
  fallbackMessage: string,
) {
  if (!walletAddress) {
    throw new Error(fallbackMessage)
  }

  if (localStorage.getItem('prooflab_token')) return

  const { accessToken, user } = await authService.walletLogin(walletAddress)
  localStorage.setItem('prooflab_token', accessToken)
  walletStore.setUser(user)
}
