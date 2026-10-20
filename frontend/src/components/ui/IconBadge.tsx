import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type IconBadgeTone = 'cyan' | 'purple' | 'green' | 'orange'

const tones: Record<IconBadgeTone, string> = {
  cyan: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-200',
  purple: 'border-purple-300/25 bg-purple-300/10 text-purple-200',
  green: 'border-green-300/25 bg-green-300/10 text-green-200',
  orange: 'border-orange-300/25 bg-orange-300/10 text-orange-200',
}

export function IconBadge({ icon: Icon, tone = 'cyan', className }: { icon: LucideIcon; tone?: IconBadgeTone; className?: string }) {
  return <span className={cn('grid size-11 place-items-center rounded-xl border', tones[tone], className)}><Icon aria-hidden className="size-5" /></span>
}
