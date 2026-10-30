import { FlaskConical, Network } from 'lucide-react'
import { Link } from 'react-router-dom'
import { brand } from '@/content/brand'

export function BrandLink() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 text-slate-100 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
    >
      <span className="grid size-9 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10">
        <FlaskConical aria-hidden className="size-5 text-cyan-200" />
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-tight">{brand.name}</span>
        <span className="hidden items-center gap-1 font-mono text-[10px] uppercase text-green-300/80 sm:flex">
          <Network aria-hidden className="size-3" />
          {brand.tagline}
        </span>
      </span>
    </Link>
  )
}
