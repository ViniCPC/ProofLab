import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080c14]">
      {/* Ambient glow — purely decorative */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(168,85,247,0.08) 0%, transparent 60%)',
        }}
      />

      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-slate-800/60 py-4 text-center text-xs text-slate-700">
        ProofLab — Decentralized Research Funding · Solana Devnet
      </footer>
    </div>
  )
}
