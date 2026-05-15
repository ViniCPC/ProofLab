import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SubmitMilestoneDialogProps {
  milestoneTitle: string
  disabled?: boolean
  onSubmit: (payload: {
    submittedReport: string
    progress: number
    evidenceText: string
  }) => Promise<void>
}

export function SubmitMilestoneDialog({
  milestoneTitle,
  disabled,
  onSubmit,
}: SubmitMilestoneDialogProps) {
  const [open, setOpen] = useState(false)
  const [submittedReport, setSubmittedReport] = useState('')
  const [progress, setProgress] = useState(80)
  const [evidenceText, setEvidenceText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSubmit({ submittedReport, progress, evidenceText })
      setSubmittedReport('')
      setProgress(80)
      setEvidenceText('')
      setOpen(false)
    } catch {
      setError('Não foi possível enviar o relatório da milestone.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button type="button" size="sm" disabled={disabled}>
          Enviar relatório
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-100">
                Enviar relatório da milestone
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                {milestoneTitle}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-900 hover:text-slate-200"
                aria-label="Fechar modal"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={submitReport} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-medium text-slate-400">
                Relatório de progresso
              </span>
              <textarea
                value={submittedReport}
                onChange={(event) => setSubmittedReport(event.target.value)}
                className="min-h-32 w-full resize-y rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
                placeholder="Descreva o que foi entregue, decisões técnicas e resultados obtidos."
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-medium text-slate-400">
                Progresso estimado: {progress}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(event) => setProgress(Number(event.target.value))}
                className="w-full accent-cyan-300"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-medium text-slate-400">
                Evidências
              </span>
              <textarea
                value={evidenceText}
                onChange={(event) => setEvidenceText(event.target.value)}
                className="min-h-28 w-full resize-y rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
                placeholder="Inclua links, hashes, observações ou resultados que ajudem a IA e a comunidade."
                required
              />
            </label>

            {error && <p className="text-sm text-red-200">{error}</p>}

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" loading={loading}>
                Enviar para análise
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
