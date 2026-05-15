import { cn } from '@/lib/utils'

type CardGlow = 'purple' | 'cyan' | 'green' | 'none'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: CardGlow
}

const glowMap: Record<CardGlow, string> = {
  purple:
    'hover:border-purple-400/45 hover:shadow-[0_0_28px_-6px_rgba(168,85,247,0.26)]',
  cyan:
    'hover:border-cyan-300/45 hover:shadow-[0_0_28px_-6px_rgba(34,211,238,0.26)]',
  green:
    'hover:border-green-300/45 hover:shadow-[0_0_28px_-6px_rgba(74,222,128,0.24)]',
  none: '',
}

export function Card({
  className,
  glow = 'purple',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-800/90 bg-slate-950/55 p-5 backdrop-blur-xl',
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

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-4 flex items-start justify-between gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-sm font-semibold leading-snug text-slate-100', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  )
}
