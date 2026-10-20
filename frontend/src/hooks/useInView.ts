import type { RefObject } from 'react'
import { useEffect, useState } from 'react'

export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  threshold = 0.2,
) {
  const [inView, setInView] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (inView || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [inView, ref, threshold])

  return inView
}
