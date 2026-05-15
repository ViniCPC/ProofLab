import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Wallet, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { shortenAddress } from '@/utils/format'

export function WalletConnectButton() {
  const { publicKey, disconnect, connecting } = useWallet()
  const { setVisible } = useWalletModal()

  if (publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 font-mono text-xs text-cyan-300 sm:inline">
          {shortenAddress(publicKey.toBase58())}
        </span>
        <Button variant="ghost" size="sm" onClick={disconnect} title="Disconnect">
          <LogOut className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      loading={connecting}
      onClick={() => setVisible(true)}
    >
      <Wallet className="size-3.5" />
      Connect Wallet
    </Button>
  )
}
