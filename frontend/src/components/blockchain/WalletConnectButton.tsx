import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { LogOut, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useWalletStore } from '@/store/walletStore'
import { shortenAddress } from '@/utils/format'

export function WalletConnectButton() {
  const { setVisible } = useWalletModal()
  const { loading, logout } = useAuth()
  const { walletAddress, connectionStatus } = useWalletStore()
  const connecting = connectionStatus === 'connecting'

  if (walletAddress) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden rounded-lg border border-green-300/20 bg-green-300/10 px-3 py-1.5 font-mono text-xs text-green-200 sm:inline">
          {shortenAddress(walletAddress)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          loading={loading}
          onClick={() => void logout()}
          title="Desconectar carteira"
          aria-label="Desconectar carteira"
        >
          <LogOut className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="primary"
      size="sm"
      loading={connecting}
      onClick={() => setVisible(true)}
    >
      <Wallet className="size-3.5" />
      Conectar carteira
    </Button>
  )
}
