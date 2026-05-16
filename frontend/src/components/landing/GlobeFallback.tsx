import {
  Activity,
  Bot,
  Landmark,
  Network,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { globeArcs } from '@/data/globeArcs'
import { globeNodes, type GlobeNodeType } from '@/data/globeNodes'
import { cn } from '@/lib/utils'

const nodeStyles: Record<GlobeNodeType, string> = {
  research: 'border-cyan-200/80 bg-cyan-300 text-cyan-950 shadow-cyan-300/70',
  donor: 'border-green-200/80 bg-green-300 text-green-950 shadow-green-300/60',
  dao: 'border-purple-200/80 bg-purple-300 text-purple-950 shadow-purple-300/60',
  ai: 'border-yellow-100/80 bg-yellow-200 text-yellow-950 shadow-yellow-200/60',
  validator: 'border-sky-200/80 bg-sky-300 text-sky-950 shadow-sky-300/60',
}

const nodePositions = [
  'left-[18%] top-[58%]',
  'left-[38%] top-[36%]',
  'left-[52%] top-[32%]',
  'left-[78%] top-[47%]',
  'left-[57%] top-[42%]',
]

const iconStyles = 'size-4'

const typeIcons: Record<GlobeNodeType, LucideIcon> = {
  research: Activity,
  donor: WalletCards,
  dao: Landmark,
  ai: Bot,
  validator: Network,
}

export function GlobeFallback() {
  return (
    <div
      className="relative min-h-[360px] overflow-hidden rounded-xl"
      aria-label="Mapa global simplificado do fluxo ProofLab"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_64%_56%,rgba(168,85,247,0.16),transparent_42%),linear-gradient(145deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/20 bg-cyan-300/[0.03] shadow-[0_0_90px_-42px_rgba(34,211,238,0.95)]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-200/16" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-green-200/14" />

      <div className="absolute left-[13%] top-[48%] h-px w-[72%] -rotate-12 bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent motion-safe:animate-pulse" />
      <div className="absolute left-[24%] top-[34%] h-px w-[55%] rotate-[18deg] bg-gradient-to-r from-transparent via-purple-200/40 to-transparent motion-safe:animate-pulse" />
      <div className="absolute left-[30%] top-[64%] h-px w-[50%] rotate-[-26deg] bg-gradient-to-r from-transparent via-green-200/38 to-transparent motion-safe:animate-pulse" />

      <div className="absolute inset-x-6 bottom-6 top-8 rounded-[50%] border border-cyan-200/10" />
      <div className="absolute inset-x-12 bottom-12 top-14 rounded-[50%] border border-cyan-200/10" />
      <div className="absolute bottom-8 left-12 right-12 h-12 rounded-[50%] bg-cyan-300/10 blur-2xl" />

      {globeNodes.map((node, index) => {
        const Icon = typeIcons[node.type]

        return (
          <div
            key={node.id}
            className={cn(
              'absolute grid size-9 place-items-center rounded-full border shadow-[0_0_26px_-8px] transition-transform motion-safe:animate-[slide-up_0.5s_ease-out]',
              nodeStyles[node.type],
              nodePositions[index],
            )}
            title={node.name}
          >
            <Icon className={iconStyles} />
          </div>
        )
      })}

      <div className="absolute left-5 top-5 rounded-lg border border-cyan-200/16 bg-slate-950/54 px-3 py-2 text-left backdrop-blur-xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/90">
          Rede ProofLab
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {globeNodes.length} nodes | {globeArcs.length} funding flows
        </p>
      </div>
    </div>
  )
}
