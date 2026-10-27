import { ProgressBar } from '@/components/ui/ProgressBar'
import type { VoteSummary } from '@/types'
import { formatUsdc } from '@/utils/format'

interface VoteProgressProps {
  summary: VoteSummary
}

// The contract weighs votes by contribution and only approves when "yes"
// outweighs "no": a tie rejects the milestone.
function getApprovalPercentage(approvedWeight: number, rejectedWeight: number) {
  const totalWeight = approvedWeight + rejectedWeight
  if (totalWeight === 0) return 0
  return Math.round((approvedWeight / totalWeight) * 100)
}

function formatVotes(count: number) {
  return count === 1 ? '1 voto' : `${count} votos`
}

export function VoteProgress({ summary }: VoteProgressProps) {
  const approvedWeight = Number(summary.approvedWeight)
  const rejectedWeight = Number(summary.rejectedWeight)
  const approvalPercentage = getApprovalPercentage(approvedWeight, rejectedWeight)
  const approving = approvedWeight > rejectedWeight

  return (
    <div className="space-y-4">
      <ProgressBar
        value={approvalPercentage}
        label="Aprovação (peso por valor doado)"
        tone={approving ? 'green' : 'purple'}
      />

      <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <p className="text-slate-500">Aprovar</p>
          <p className="mt-1 font-mono text-sm text-green-200">
            {formatUsdc(approvedWeight)} USDC
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {formatVotes(summary.approved)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <p className="text-slate-500">Rejeitar</p>
          <p className="mt-1 font-mono text-sm text-purple-200">
            {formatUsdc(rejectedWeight)} USDC
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {formatVotes(summary.rejected)}
          </p>
        </div>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        {summary.total === 0
          ? 'Nenhum voto ainda. Sem votos a favor, a etapa é rejeitada.'
          : approving
            ? 'Resultado parcial: a etapa seria aprovada.'
            : 'Resultado parcial: a etapa seria rejeitada. Empate também rejeita.'}
      </p>
    </div>
  )
}
