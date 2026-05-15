import { Outlet } from 'react-router-dom'
import { BlockchainGlowBackground } from './BlockchainGlowBackground'
import { Navbar } from './Navbar'

export function AppShell() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#070b13]">
      <BlockchainGlowBackground />

      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-slate-800/60 py-4 text-center text-xs text-slate-700">
        ProofLab | Financiamento científico descentralizado | Solana Devnet
      </footer>
    </div>
  )
}
