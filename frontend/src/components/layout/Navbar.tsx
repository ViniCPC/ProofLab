import { Link, useLocation } from 'react-router-dom'
import { WalletConnectButton } from '@/components/blockchain/WalletConnectButton'
import { cn } from '@/lib/utils'
import { BrandLink } from './BrandLink'

// Same names the landing page uses for these destinations.
const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/explore', label: 'Explorar pesquisas' },
  { to: '/create', label: 'Criar pesquisa' },
]

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-300/10 bg-[#070b13]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <BrandLink />

        <nav
          className="hidden items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-950/45 p-1 md:flex"
          aria-label="Navegação principal"
        >
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
