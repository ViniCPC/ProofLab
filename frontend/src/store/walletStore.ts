import { useSyncExternalStore } from 'react'
import type { AuthUser } from '@/types/user'

export type WalletConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'

interface WalletState {
  walletAddress: string | null
  connectionStatus: WalletConnectionStatus
  user: AuthUser | null
}

const initialWalletState: WalletState = {
  walletAddress: null,
  connectionStatus: 'disconnected',
  user: null,
}

let walletState = initialWalletState
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function setWalletState(nextState: Partial<WalletState>) {
  walletState = {
    ...walletState,
    ...nextState,
  }
  emitChange()
}

export const walletStore = {
  getState: () => walletState,

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  setConnection: (
    walletAddress: string | null,
    connectionStatus: WalletConnectionStatus,
  ) => {
    setWalletState({
      walletAddress,
      connectionStatus,
      user: walletAddress ? walletState.user : null,
    })
  },

  setUser: (user: AuthUser | null) => {
    setWalletState({ user })
  },

  reset: () => {
    walletState = initialWalletState
    emitChange()
  },
}

export function useWalletStore() {
  return useSyncExternalStore(
    walletStore.subscribe,
    walletStore.getState,
    walletStore.getState,
  )
}
