import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080c14]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-600">
        ProofLab | Financiamento científico descentralizado na Solana
      </footer>
    </div>
  )
}
