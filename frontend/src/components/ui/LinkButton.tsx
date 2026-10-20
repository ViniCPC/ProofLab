import type { LinkProps } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const linkButtonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60',
  {
    variants: {
      variant: {
        primary:
          'border-cyan-300/40 bg-cyan-300 text-slate-950 shadow-[0_0_28px_-10px_rgba(34,211,238,0.9)] hover:bg-cyan-200',
        secondary:
          'border-purple-300/30 bg-purple-300/10 text-purple-100 hover:bg-purple-300/15',
        ghost:
          'border-transparent bg-transparent text-slate-400 hover:bg-slate-800/55 hover:text-slate-100',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

interface LinkButtonProps extends LinkProps, VariantProps<typeof linkButtonStyles> {
  className?: string
}

export function LinkButton({ className, variant, size, ...props }: LinkButtonProps) {
  return (
    <Link className={cn(linkButtonStyles({ variant, size }), className)} {...props} />
  )
}
