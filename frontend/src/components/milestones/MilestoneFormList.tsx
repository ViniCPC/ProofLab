import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  MilestoneFormItem,
  type MilestoneDraft,
} from './MilestoneFormItem'

interface MilestoneFormListProps {
  milestones: MilestoneDraft[]
  onChange: (milestones: MilestoneDraft[]) => void
}

function createMilestone(order: number): MilestoneDraft {
  return {
    title: '',
    description: '',
    amount: '',
    order,
  }
}

function normalizeOrders(milestones: MilestoneDraft[]) {
  return milestones.map((milestone, index) => ({
    ...milestone,
    order: index + 1,
  }))
}

export function MilestoneFormList({
  milestones,
  onChange,
}: MilestoneFormListProps) {
  function addMilestone() {
    onChange([...milestones, createMilestone(milestones.length + 1)])
  }

  function updateMilestone(index: number, milestone: MilestoneDraft) {
    const nextMilestones = milestones.map((item, itemIndex) =>
      itemIndex === index ? milestone : item,
    )
    onChange(nextMilestones)
  }

  function removeMilestone(index: number) {
    const nextMilestones = milestones.filter(
      (_milestone, itemIndex) => itemIndex !== index,
    )
    onChange(normalizeOrders(nextMilestones))
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Milestones</h2>
          <p className="text-sm text-slate-500">
            Divida a pesquisa em entregas verificáveis.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={addMilestone}>
          <Plus className="size-4" />
          Adicionar etapa
        </Button>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <MilestoneFormItem
            key={index}
            milestone={milestone}
            index={index}
            canRemove={milestones.length > 1}
            onChange={updateMilestone}
            onRemove={removeMilestone}
          />
        ))}
      </div>
    </section>
  )
}
