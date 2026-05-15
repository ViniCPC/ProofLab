import { WalletCards } from 'lucide-react'
import { ResearchStatusBadge } from './ResearchStatusBadge'
import { getResearchDisplayStatus } from './researchStatus'
import { Card } from '@/components/ui/Card'
import type { ResearchProject } from '@/types'
import { shortenAddress } from '@/utils/format'

interface ResearchHeaderProps {
  project: ResearchProject
}

export function ResearchHeader({ project }: ResearchHeaderProps) {
  const projectWallet =
    project.onChainProjectAddress ?? project.creator?.walletAddress ?? project.creatorId
  const researcher = project.creator?.name ?? 'Pesquisador conectado por wallet'

  return (
    <Card glow="cyan" className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <ResearchStatusBadge status={getResearchDisplayStatus(project)} />
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-50">
            {project.title}
          </h1>
          <p className="max-w-4xl text-sm leading-6 text-slate-400">
            {project.description}
          </p>
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-800/80 pt-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Pesquisador</p>
          <p className="mt-1 text-sm font-medium text-slate-200">
            {researcher}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Wallet/projeto</p>
          <p className="mt-1 flex items-center gap-2 font-mono text-sm text-cyan-200">
            <WalletCards className="size-4" />
            {shortenAddress(projectWallet, 6)}
          </p>
        </div>
      </div>
    </Card>
  )
}
