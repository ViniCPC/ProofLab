import { FlaskConical, Network } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { WalletConnectButton } from '@/components/blockchain/WalletConnectButton'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/', label: 'Painel' },
  { to: '/explore', label: 'Pesquisas' },
  { to: '/create', label: 'Enviar' },
]

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-300/10 bg-[#070b13]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-3 text-slate-100 transition-colors hover:text-white"
        >
          <span className="grid size-9 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_30px_-10px_rgba(34,211,238,0.7)]">
            <FlaskConical className="size-5 text-cyan-200" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight">
              ProofLab
            </span>
            <span className="hidden items-center gap-1 font-mono text-[10px] uppercase text-green-300/80 sm:flex">
              <Network className="size-3" />
              Custódia científica Solana
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-950/45 p-1 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm transition-colors',
                pathname === to
                  ? 'bg-cyan-300/10 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <WalletConnectButton />
      </div>
    </header>
  )
}
