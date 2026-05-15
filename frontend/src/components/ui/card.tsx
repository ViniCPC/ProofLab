import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'purple' | 'cyan' | 'green' | 'none'
}

const glowMap = {
  purple: 'hover:border-purple-500/40 hover:shadow-[0_0_24px_-4px_rgba(168,85,247,0.2)]',
  cyan:   'hover:border-cyan-500/40   hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.2)]',
  green:  'hover:border-green-500/40  hover:shadow-[0_0_24px_-4px_rgba(74,222,128,0.2)]',
  none:   '',
}

export function Card({ className, glow = 'purple', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm',
        'transition-all duration-300',
        glowMap[glow],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-sm font-semibold text-slate-200 leading-snug', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  )
}
