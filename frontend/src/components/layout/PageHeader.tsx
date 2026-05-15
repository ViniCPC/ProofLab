import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
