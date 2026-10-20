import { Outlet } from 'react-router-dom'
import { BlockchainGlowBackground } from '@/components/layout/BlockchainGlowBackground'
import { LandingNavbar } from '@/components/landing/LandingNavbar'

export function LandingLayout() {
  return <div className="relative min-h-screen overflow-hidden bg-[#070b13]"><BlockchainGlowBackground /><div className="relative z-10"><LandingNavbar /><Outlet /></div></div>
}
