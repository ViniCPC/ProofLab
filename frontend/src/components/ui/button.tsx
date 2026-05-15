import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary:   'bg-purple-600 hover:bg-purple-500 text-white border-transparent shadow-[0_0_12px_-2px_rgba(168,85,247,0.4)]',
  secondary: 'bg-transparent hover:bg-slate-800 text-slate-300 border-slate-700',
  ghost:     'bg-transparent hover:bg-slate-800/50 text-slate-400 border-transparent',
  danger:    'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/30',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-7  px-3 text-xs',
  md: 'h-9  px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
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
        'focus-visible:ring-purple-500/50 disabled:cursor-not-allowed disabled:opacity-40',
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
