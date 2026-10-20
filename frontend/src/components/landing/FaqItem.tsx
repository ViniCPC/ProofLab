import { ChevronDown } from 'lucide-react'

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group p-2">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-4 py-3 text-left text-base font-medium text-white transition-colors hover:bg-slate-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
        {question}
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-cyan-300 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <p className="px-4 pb-4 pt-2 text-sm leading-6 text-slate-400">{answer}</p>
        </div>
      </div>
    </details>
  )
}
