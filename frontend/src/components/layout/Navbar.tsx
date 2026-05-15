import { FlaskConical } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { WalletConnectButton } from '@/components/blockchain/WalletConnectButton'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/',        label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/create',  label: 'Submit Research' },
]

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-slate-200 transition-colors hover:text-white">
          <FlaskConical className="size-5 text-purple-400" />
          <span className="font-semibold tracking-tight">ProofLab</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm transition-colors',
                pathname === to
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300',
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
