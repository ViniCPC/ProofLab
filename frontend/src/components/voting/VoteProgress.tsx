import { ProgressBar } from '@/components/ui/ProgressBar'
import type { VoteSummary } from '@/types'

interface VoteProgressProps {
  summary: VoteSummary
}

function getApprovalPercentage(summary: VoteSummary) {
  if (summary.total === 0) return 0
  return Math.round((summary.approved / summary.total) * 100)
}

export function VoteProgress({ summary }: VoteProgressProps) {
  const approvalPercentage = getApprovalPercentage(summary)

  return (
    <div className="space-y-4">
      <ProgressBar
        value={approvalPercentage}
        label="Aprovação"
        tone={approvalPercentage >= 50 ? 'green' : 'purple'}
      />

      <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <p className="text-slate-500">Aprovar</p>
          <p className="mt-1 font-mono text-sm text-green-200">{summary.approved}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <p className="text-slate-500">Rejeitar</p>
          <p className="mt-1 font-mono text-sm text-purple-200">{summary.rejected}</p>
        </div>
      </div>
    </div>
  )
}
