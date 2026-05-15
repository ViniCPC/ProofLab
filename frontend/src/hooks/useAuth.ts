import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { api } from '@/services/api'

interface AuthUser {
  id: string
  name: string
  walletAddress: string
  role: string
}

export function useAuth() {
  const { publicKey, connected, disconnect } = useWallet()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async () => {
    if (!publicKey) return

    setLoading(true)
    try {
      const { token, user: authUser } = await api.post<{ token: string; user: AuthUser }>(
        '/auth/wallet-login',
        { walletAddress: publicKey.toBase58() },
      )
      localStorage.setItem('prooflab_token', token)
      setUser(authUser)
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  const logout = useCallback(() => {
    localStorage.removeItem('prooflab_token')
    setUser(null)
    disconnect()
  }, [disconnect])

  useEffect(() => {
    if (connected && publicKey && !user) {
      login()
    }
    if (!connected) {
      setUser(null)
    }
  }, [connected, publicKey, user, login])

  return { user, loading, login, logout, isAuthenticated: !!user }
}
