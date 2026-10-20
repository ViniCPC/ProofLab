import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const sectionStyles = cva('relative', {
  variants: {
    tone: {
      base: 'bg-transparent',
      surface: 'border-t border-white/5 bg-slate-950/20',
      accent: 'bg-cyan-300/[0.035]',
    },
    spacing: {
      compact: 'py-14 sm:py-20',
      default: 'py-20 sm:py-28',
      loose: 'py-24 sm:py-32',
    },
  },
  defaultVariants: { tone: 'base', spacing: 'default' },
})

interface SectionProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof sectionStyles> {
  id?: string
}

export function Section({ className, tone, spacing, ...props }: SectionProps) {
  return (
    <section className={cn(sectionStyles({ tone, spacing }), className)} {...props} />
  )
}
