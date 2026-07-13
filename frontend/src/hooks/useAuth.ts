import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { walletStore } from '@/store/walletStore'
import type { AuthUser } from '@/types/user'
import { signInWithWallet } from '@/utils/wallet'

export function useAuth() {
  const { publicKey, connected, connecting, disconnect, signMessage } =
    useWallet()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async () => {
    if (!publicKey || !signMessage) return

    setLoading(true)
    try {
      await signInWithWallet(publicKey.toBase58(), signMessage)
      const authUser = walletStore.getState().user
      setUser(authUser)
    } finally {
      setLoading(false)
    }
  }, [publicKey, signMessage])

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
