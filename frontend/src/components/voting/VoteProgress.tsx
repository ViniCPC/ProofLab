import { ProgressBar } from '@/components/ui/ProgressBar'
import type { VoteSummary } from '@/types'

interface VoteProgressProps {
  summary: VoteSummary
  eligibleVoters: number
}

function getApprovalPercentage(summary: VoteSummary) {
  if (summary.total === 0) return 0
  return Math.round((summary.approved / summary.total) * 100)
}

function getQuorumRequired(eligibleVoters: number) {
  return Math.max(1, Math.ceil(eligibleVoters * 0.2))
}

export function VoteProgress({ summary, eligibleVoters }: VoteProgressProps) {
  const approvalPercentage = getApprovalPercentage(summary)
  const quorumRequired = getQuorumRequired(eligibleVoters)
  const hasQuorum = summary.total >= quorumRequired

  return (
    <div className="space-y-4">
      <ProgressBar
        value={approvalPercentage}
        label="Aprovação"
        tone={approvalPercentage >= 50 ? 'green' : 'purple'}
      />

      <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <p className="text-slate-500">Aprovar</p>
          <p className="mt-1 font-mono text-sm text-green-200">
            {summary.approved}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <p className="text-slate-500">Rejeitar</p>
          <p className="mt-1 font-mono text-sm text-purple-200">
            {summary.rejected}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <p className="text-slate-500">Quórum</p>
          <p className="mt-1 font-mono text-sm text-cyan-200">
            {summary.total}/{quorumRequired}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        {hasQuorum
          ? 'Quórum mínimo atingido para a comunidade decidir.'
          : 'A votação ainda precisa de mais doadores participando.'}
      </p>
    </div>
  )
}
