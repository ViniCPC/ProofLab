import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function CopyableAddress({ address, className }: { address: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button type="button" onClick={() => void copy()} className={cn('inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-left font-mono text-xs text-slate-300 hover:border-cyan-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60', className)} aria-label="Copiar endereço do programa">
      <span className="truncate">{address}</span>
      {copied ? <Check aria-hidden className="size-3.5 shrink-0 text-green-300" /> : <Copy aria-hidden className="size-3.5 shrink-0 text-cyan-300" />}
    </button>
  )
}
