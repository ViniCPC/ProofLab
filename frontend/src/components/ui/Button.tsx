import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border-cyan-300/40 bg-cyan-300 text-slate-950 shadow-[0_0_28px_-10px_rgba(34,211,238,0.9)] hover:bg-cyan-200',
  secondary:
    'border-purple-300/30 bg-purple-300/10 text-purple-100 hover:bg-purple-300/15',
  ghost:
    'border-transparent bg-transparent text-slate-400 hover:bg-slate-800/55 hover:text-slate-100',
  danger:
    'border-red-400/35 bg-red-500/15 text-red-200 hover:bg-red-500/25',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-sm',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border font-medium',
        'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-40',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
