import { ChevronDown } from 'lucide-react'

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">
        {question}
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-cyan-300 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">{answer}</p>
        </div>
      </div>
    </details>
  )
}
