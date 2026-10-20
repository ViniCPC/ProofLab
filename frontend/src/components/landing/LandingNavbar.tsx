import { FlaskConical, Network } from 'lucide-react'
import { Link } from 'react-router-dom'
import { landingContent } from '@/content/landing'
import { LinkButton } from '@/components/ui/LinkButton'
import { MobileMenu } from './MobileMenu'

export function LandingNavbar() {
  const { nav } = landingContent
  return (
    <header className="sticky top-0 z-40 border-b border-cyan-300/10 bg-[#070b13]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-3 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
        >
          <span className="grid size-9 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10">
            <FlaskConical aria-hidden className="size-5 text-cyan-200" />
          </span>
          <span>
            <span className="block text-sm font-semibold">ProofLab</span>
            <span className="hidden items-center gap-1 font-mono text-[10px] uppercase text-green-300/80 sm:flex">
              <Network aria-hidden className="size-3" />
              Escrow científico
            </span>
          </span>
        </Link>
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Navegação principal"
        >
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LinkButton to="/explore" size="sm" className="hidden sm:inline-flex">
            {nav.appCta}
          </LinkButton>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
