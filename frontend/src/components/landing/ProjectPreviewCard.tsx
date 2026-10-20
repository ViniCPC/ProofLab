import { ArrowUpRight, Bot, Milestone } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { FundingStats, ResearchProject } from '@/types'
import { landingContent } from '@/content/landing'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LinkButton } from '@/components/ui/LinkButton'

interface Props { project: ResearchProject | null; funding: FundingStats | null; loading: boolean }

function amount(value: string) { return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

export function ProjectPreviewCard({ project, funding, loading }: Props) {
  const copy = landingContent.hero
  if (loading) return <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6"><Skeleton className="h-4 w-32" /><Skeleton className="mt-5 h-8 w-4/5" /><Skeleton className="mt-4 h-4 w-full" /><Skeleton className="mt-8 h-2 w-full" /><div className="mt-6 grid grid-cols-2 gap-3"><Skeleton className="h-16" /><Skeleton className="h-16" /></div></div>
  if (!project) return <div className="flex min-h-[360px] flex-col justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6"><p className="font-mono text-xs uppercase text-cyan-300">{copy.previewLabel}</p><h2 className="mt-4 text-2xl font-semibold text-white">{copy.previewEmpty}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{copy.previewFallback}</p><LinkButton to="/create" variant="secondary" className="mt-7 w-fit">{landingContent.audience.researcher.cta}<ArrowUpRight aria-hidden className="size-4" /></LinkButton></div>

  const milestones = project.milestones?.length ?? 0
  const progress = funding?.fundingPercentage ?? 0
  return <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/65 p-6 shadow-[0_0_60px_-35px_rgba(34,211,238,0.9)]">
    <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase text-cyan-300">{copy.previewLabel}</p><h2 className="mt-3 text-xl font-semibold text-white">{project.title}</h2></div><Bot aria-hidden className="size-5 text-green-300" /></div>
    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{project.description}</p>
    <div className="mt-7"><ProgressBar value={progress} label={`${amount(funding?.totalRaised ?? '0')} / ${amount(project.totalAmount)} USDC ${copy.previewProgress}`} /></div>
    <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"><Milestone aria-hidden className="size-4 text-purple-300" /><p className="mt-3 font-mono text-xl text-white">{milestones}</p><p className="text-xs text-slate-500">{copy.previewMilestones}</p></div><div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"><Bot aria-hidden className="size-4 text-green-300" /><p className="mt-3 text-sm font-medium text-white">{project.aiStatus === 'COMPLETED' ? copy.previewAiComplete : copy.previewAiPending}</p><p className="mt-1 text-xs text-slate-500">{copy.previewDeadline}</p></div></div>
    <Link to={`/research/${project.id}`} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">{copy.previewLink} <ArrowUpRight aria-hidden className="size-4" /></Link>
  </div>
}
