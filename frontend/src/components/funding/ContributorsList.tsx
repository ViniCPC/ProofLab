import { Card } from '@/components/ui/Card'
import type { Contribution } from '@/types'
import { formatUsdc, shortenAddress } from '@/utils/format'

interface ContributorsListProps {
  contributors: Contribution[]
}

export function ContributorsList({ contributors }: ContributorsListProps) {
  return (
    <Card glow="none" className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase text-green-300">doadores</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-100">
          Investidores do projeto
        </h2>
      </div>

      {contributors.length === 0 ? (
        <p className="text-sm text-slate-500">
          Ainda não há contribuições registradas.
        </p>
      ) : (
        <div className="space-y-3">
          {contributors.map((contribution) => (
            <div
              key={contribution.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3"
            >
              <div>
                <p className="font-mono text-sm text-cyan-200">
                  {shortenAddress(contribution.wallet, 6)}
                </p>
                <p className="text-xs text-slate-500">
                  {contribution.funder.name}
                </p>
              </div>
              <p className="font-mono text-sm text-slate-100">
                {formatUsdc(contribution.amount)} USDC
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
