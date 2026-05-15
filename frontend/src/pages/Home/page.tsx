import { FlaskConical, ShieldCheck, Coins } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const features = [
  {
    icon: FlaskConical,
    color: 'text-purple-400',
    title: 'AI-Reviewed Research',
    description: 'Every project is scored for innovation, feasibility and risk before funding.',
  },
  {
    icon: Coins,
    color: 'text-cyan-400',
    title: 'On-Chain Escrow',
    description: 'Funds are locked in a Solana smart contract and released per milestone.',
  },
  {
    icon: ShieldCheck,
    color: 'text-green-400',
    title: 'Community Voting',
    description: 'Token holders vote to approve milestone completions before payout.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-16 py-12 animate-[fade-in_0.4s_ease-out]">
      {/* Hero */}
      <div className="max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
          <span className="size-1.5 rounded-full bg-purple-400 animate-pulse" />
          Live on Solana Devnet
        </div>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-100">
          Fund science.{' '}
          <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
            On-chain.
          </span>
        </h1>
        <p className="mb-8 text-lg text-slate-400">
          ProofLab connects researchers with funders through transparent milestone-based escrow and community governance.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/explore">
            <Button size="lg">Explore Research</Button>
          </Link>
          <Link to="/create">
            <Button size="lg" variant="secondary">Submit a Project</Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, color, title, description }) => (
          <Card key={title} className="animate-[slide-up_0.3s_ease-out]">
            <Icon className={`mb-3 size-6 ${color}`} />
            <h3 className="mb-1 text-sm font-semibold text-slate-200">{title}</h3>
            <p className="text-xs leading-relaxed text-slate-500">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
