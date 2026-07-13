import { api } from './api'
import type { WalletLoginResponse } from '@/types/user'

export const authService = {
  requestNonce: (walletAddress: string) =>
    api.post<{ message: string }>('/auth/nonce', { walletAddress }),

  walletLogin: (walletAddress: string, signature: string) =>
    api.post<WalletLoginResponse>('/auth/wallet-login', {
      walletAddress,
      signature,
    }),
}
