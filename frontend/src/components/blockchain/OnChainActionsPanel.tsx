import { Network } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ResearchProject } from '@/types'

interface OnChainActionsPanelProps {
  project: ResearchProject
  loading?: boolean
  cancelLoading?: boolean
  onCreateProject: () => Promise<void>
  onCancelProject: () => Promise<void>
}

export function OnChainActionsPanel({
  project,
  loading,
  cancelLoading,
  onCreateProject,
  onCancelProject,
}: OnChainActionsPanelProps) {
  const registered = Boolean(project.onChainProjectAddress)
  const canCancel =
    registered &&
    project.onChainStatus !== 'Cancelled' &&
    project.onChainStatus !== 'Completed'

  if (registered && !canCancel) return null

  return (
    <Card glow="cyan" className="space-y-4">
      <div className="flex items-center gap-2 text-cyan-200">
        <Network className="size-5" />
        <h2 className="text-lg font-semibold">Gerenciar projeto</h2>
      </div>

      {registered ? (
        <>
          <p className="text-sm leading-6 text-slate-400">
            Cancelar encerra o projeto no contrato e libera o reembolso proporcional
            para quem contribuiu.
          </p>
          <Button
            type="button"
            variant="danger"
            loading={cancelLoading}
            onClick={() => void onCancelProject()}
          >
            Cancelar projeto
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm leading-6 text-slate-400">
            Registre o projeto e as etapas na Solana para abrir as contribuições no
            escrow.
          </p>
          <Button
            type="button"
            loading={loading}
            onClick={() => void onCreateProject()}
          >
            Registrar na Solana
          </Button>
        </>
      )}
    </Card>
  )
}
