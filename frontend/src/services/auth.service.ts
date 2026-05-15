import { api } from './api'
import type { WalletLoginResponse } from '@/types/user'

export const authService = {
  walletLogin: (walletAddress: string) =>
    api.post<WalletLoginResponse>('/auth/wallet-login', { walletAddress }),
}
