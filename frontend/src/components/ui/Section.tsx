import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const sectionStyles = cva('relative py-20 sm:py-28', {
  variants: {
    tone: {
      base: 'bg-transparent',
      surface: 'border-y border-white/5 bg-slate-950/20',
      accent: 'bg-cyan-300/[0.035]',
    },
  },
  defaultVariants: { tone: 'base' },
})

interface SectionProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof sectionStyles> {
  id?: string
}

export function Section({ className, tone, ...props }: SectionProps) {
  return <section className={cn(sectionStyles({ tone }), className)} {...props} />
}
