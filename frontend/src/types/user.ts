export interface UserSummary {
  id: string
  name: string
  walletAddress: string
  role?: string
  reputation?: number
  createdAt?: string
}

export interface AuthUser extends UserSummary {
  role: string
}

export interface WalletLoginResponse {
  accessToken: string
  user: AuthUser
}
