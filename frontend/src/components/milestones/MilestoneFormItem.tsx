import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export interface MilestoneDraft {
  title: string
  description: string
  amount: string
  order: number
}

interface MilestoneFormItemProps {
  milestone: MilestoneDraft
  index: number
  canRemove: boolean
  onChange: (index: number, milestone: MilestoneDraft) => void
  onRemove: (index: number) => void
}

export function MilestoneFormItem({
  milestone,
  index,
  canRemove,
  onChange,
  onRemove,
}: MilestoneFormItemProps) {
  function updateField(field: keyof MilestoneDraft, value: string) {
    const nextMilestone = {
      ...milestone,
      [field]: field === 'order' ? Number(value) : value,
    }
    onChange(index, nextMilestone)
  }

  return (
    <Card glow="none" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-cyan-300">
            Etapa {milestone.order}
          </p>
          <h3 className="text-sm font-semibold text-slate-100">
            Milestone da pesquisa
          </h3>
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            aria-label="Remover milestone"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-medium text-slate-400">Título</span>
        <input
          value={milestone.title}
          onChange={(event) => updateField('title', event.target.value)}
          className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
          placeholder="Ex.: Protocolo experimental"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-medium text-slate-400">Descrição</span>
        <textarea
          value={milestone.description}
          onChange={(event) => updateField('description', event.target.value)}
          className="min-h-24 w-full resize-y rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
          placeholder="Explique o que precisa ser entregue nesta etapa."
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium text-slate-400">Valor</span>
          <input
            value={milestone.amount}
            onChange={(event) => updateField('amount', event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
            inputMode="decimal"
            placeholder="0.000000"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium text-slate-400">Ordem</span>
          <input
            value={milestone.order}
            onChange={(event) => updateField('order', event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
            min={1}
            type="number"
            required
          />
        </label>
      </div>
    </Card>
  )
}
