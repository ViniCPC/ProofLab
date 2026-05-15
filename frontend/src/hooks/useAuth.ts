import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { authService } from '@/services/auth.service'
import { walletStore } from '@/store/walletStore'
import type { AuthUser } from '@/types/user'

export function useAuth() {
  const { publicKey, connected, connecting, disconnect } = useWallet()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async () => {
    if (!publicKey) return

    setLoading(true)
    try {
      const { accessToken, user: authUser } = await authService.walletLogin(
        publicKey.toBase58(),
      )
      localStorage.setItem('prooflab_token', accessToken)
      setUser(authUser)
      walletStore.setUser(authUser)
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  const logout = useCallback(() => {
    localStorage.removeItem('prooflab_token')
    setUser(null)
    walletStore.reset()
    disconnect()
  }, [disconnect])

  useEffect(() => {
    const walletAddress = publicKey?.toBase58() ?? null
    const connectionStatus =
      connecting ? 'connecting' : connected && walletAddress ? 'connected' : 'disconnected'

    queueMicrotask(() => {
      walletStore.setConnection(walletAddress, connectionStatus)
    })

    if (connected && publicKey && !user) {
      queueMicrotask(() => void login())
    }
    if (!connected) {
      queueMicrotask(() => {
        localStorage.removeItem('prooflab_token')
        setUser(null)
        walletStore.setUser(null)
      })
    }
  }, [connected, connecting, publicKey, user, login])

  return { user, loading, login, logout, isAuthenticated: !!user }
}
