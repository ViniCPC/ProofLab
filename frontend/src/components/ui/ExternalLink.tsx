import { ExternalLink as ExternalLinkIcon } from 'lucide-react'
import type { AnchorHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function ExternalLink({
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60',
        className,
      )}
      {...props}
    >
      {children}
      <ExternalLinkIcon aria-hidden className="size-3.5" />
    </a>
  )
}
