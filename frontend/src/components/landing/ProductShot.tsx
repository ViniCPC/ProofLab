import { Check, CircleDollarSign, FileCheck2, ShieldCheck } from 'lucide-react'
import { BrowserFrame } from './BrowserFrame'
import { landingContent } from '@/content/landing'

export type ProductShotVariant = 0 | 1 | 2 | 3 | 4

export function ProductShot({
  variant = 0,
  className,
}: {
  variant?: ProductShotVariant
  className?: string
}) {
  const copy = landingContent.productShot

  return (
    <div key={variant} className="product-shot-transition">
      <BrowserFrame className={className} label={copy.browserLabel}>
        <div className="bg-[#0a101c] p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                {copy.escrowLabel}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">
                {copy.projectTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{copy.projectDescription}</p>
            </div>
            <ShieldCheck aria-hidden className="size-5 text-green-300" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_0.8fr]">
            <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{copy.stageLabel}</span>
                <span className="rounded-full border border-green-300/25 bg-green-300/10 px-2 py-1 text-green-200">
                  {copy.statusLabel}
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {copy.stages.map((stage, index) => (
                  <div
                    key={stage.label}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors duration-500 ${index === variant ? 'border-cyan-300/35 bg-cyan-300/[0.08]' : 'border-slate-800 bg-slate-950/40'}`}
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-500 ${index < variant ? 'bg-green-300 text-slate-950' : index === variant ? 'bg-cyan-300 text-slate-950' : 'border border-slate-700 text-slate-500'}`}
                    >
                      {index < variant ? (
                        <Check aria-hidden className="size-3.5" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-slate-200">
                        {stage.label}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {index === variant ? 'Votação aberta' : stage.status}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-4">
              <CircleDollarSign aria-hidden className="size-5 text-cyan-300" />
              <p className="mt-4 text-sm font-semibold text-white">
                Custódia por etapa
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                O saldo permanece protegido até a decisão da comunidade.
              </p>
              <div className="mt-6 h-24 rounded-lg border border-dashed border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.08] to-purple-300/[0.06]" />
              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                <FileCheck2 aria-hidden className="size-3.5 text-green-300" />
                Evidências registradas
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>
    </div>
  )
}
