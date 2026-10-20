import type { HTMLAttributes } from 'react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { useInView } from '@/hooks/useInView'

export function Reveal({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref)
  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
        className,
      )}
      {...props}
    />
  )
}
