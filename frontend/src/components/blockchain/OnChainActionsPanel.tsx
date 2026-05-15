import { Network } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface OnChainActionsPanelProps {
  loading?: boolean
  cancelLoading?: boolean
  onCreateProject: () => Promise<void>
  onCancelProject: () => Promise<void>
}

export function OnChainActionsPanel({
  loading,
  cancelLoading,
  onCreateProject,
  onCancelProject,
}: OnChainActionsPanelProps) {
  return (
    <Card glow="cyan" className="space-y-4">
      <div className="flex items-center gap-2 text-cyan-200">
        <Network className="size-5" />
        <h2 className="text-lg font-semibold">Ações on-chain</h2>
      </div>
      <p className="text-sm leading-6 text-slate-400">
        Prepare transações para criar a conta do projeto, abrir votações de
        milestone e liberar recursos conforme a validação.
      </p>
      <Button
        type="button"
        variant="secondary"
        loading={loading}
        onClick={() => void onCreateProject()}
      >
        Criar projeto on-chain
      </Button>
      <Button
        type="button"
        variant="danger"
        loading={cancelLoading}
        onClick={() => void onCancelProject()}
      >
        Cancelar projeto on-chain
      </Button>
    </Card>
  )
}
