import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const bentoStyles = cva(
  'rounded-2xl border border-slate-800 bg-slate-950/50 p-6 transition-colors hover:border-cyan-300/25',
  {
    variants: { size: { sm: '', lg: 'md:col-span-2' } },
    defaultVariants: { size: 'sm' },
  },
)

interface BentoCardProps extends VariantProps<typeof bentoStyles> {
  title: string
  description: string
  children?: ReactNode
  className?: string
}

export function BentoCard({
  title,
  description,
  children,
  size,
  className,
}: BentoCardProps) {
  return (
    <article className={cn(bentoStyles({ size }), className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>
      </div>
      {children && <div className="mt-6">{children}</div>}
    </article>
  )
}
