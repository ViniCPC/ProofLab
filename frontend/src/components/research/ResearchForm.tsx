import { useState } from 'react'
import { MilestoneFormList } from '@/components/milestones/MilestoneFormList'
import type { MilestoneDraft } from '@/components/milestones/MilestoneFormItem'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CreateResearchPreview } from './CreateResearchPreview'

export interface ResearchFormValues {
  title: string
  description: string
  category: string
  totalAmount: string
  milestones: MilestoneDraft[]
}

interface ResearchFormProps {
  loading?: boolean
  error?: string | null
  successMessage?: string | null
  onSubmit: (values: ResearchFormValues) => Promise<void>
}

const initialValues: ResearchFormValues = {
  title: '',
  description: '',
  category: '',
  totalAmount: '',
  milestones: [
    {
      title: '',
      description: '',
      amount: '',
      order: 1,
    },
  ],
}

export function ResearchForm({
  loading,
  error,
  successMessage,
  onSubmit,
}: ResearchFormProps) {
  const [values, setValues] = useState<ResearchFormValues>(initialValues)

  function updateField(field: keyof ResearchFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
  }

  function updateMilestones(milestones: MilestoneDraft[]) {
    setValues((currentValues) => ({
      ...currentValues,
      milestones,
    }))
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(values)
  }

  return (
    <form onSubmit={submitForm} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card glow="purple" className="space-y-4">
          <div>
            <p className="font-mono text-xs uppercase text-purple-300">
              proposta científica
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-100">
              Dados principais
            </h2>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-medium text-slate-400">Título</span>
            <input
              value={values.title}
              onChange={(event) => updateField('title', event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
              placeholder="Ex.: Sensor de baixo custo para água potável"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium text-slate-400">
              Descrição
            </span>
            <textarea
              value={values.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              className="min-h-36 w-full resize-y rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
              placeholder="Explique o problema científico, a hipótese e o impacto esperado."
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-medium text-slate-400">
                Categoria
              </span>
              <input
                value={values.category}
                onChange={(event) =>
                  updateField('category', event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
                placeholder="Ex.: Saúde, clima, biotecnologia"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-medium text-slate-400">
                Valor total
              </span>
              <input
                value={values.totalAmount}
                onChange={(event) =>
                  updateField('totalAmount', event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
                inputMode="decimal"
                placeholder="1000.000000"
                required
              />
            </label>
          </div>
        </Card>

        <MilestoneFormList
          milestones={values.milestones}
          onChange={updateMilestones}
        />

        {error && (
          <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="rounded-lg border border-green-400/30 bg-green-500/10 p-3 text-sm text-green-200">
            {successMessage}
          </p>
        )}

        <Button type="submit" size="lg" loading={loading}>
          Criar pesquisa
        </Button>
      </div>

      <CreateResearchPreview
        title={values.title}
        category={values.category}
        totalAmount={values.totalAmount}
        milestones={values.milestones}
      />
    </form>
  )
}
