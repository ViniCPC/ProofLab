import {
  Bot,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  FileCheck2,
  ShieldCheck,
  Vote,
} from 'lucide-react'
import { RiskBadge } from '@/components/ai/RiskBadge'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatCard } from '@/components/ui/StatCard'
import { VoteProgress } from '@/components/voting/VoteProgress'
import { VotingEligibilityNotice } from '@/components/voting/VotingEligibilityNotice'
import { landingContent } from '@/content/landing'
import { cn } from '@/lib/utils'
import { formatUsdc, shortenAddress } from '@/utils/format'
import { BrowserFrame } from './BrowserFrame'

export type ProductShotVariant = 0 | 1 | 2 | 3 | 4

const copy = landingContent.productShot

const panelStyles: Record<ProductShotVariant, string> = {
  0: 'border-slate-800 bg-slate-950/65',
  1: 'border-slate-800 bg-slate-950/65',
  2: 'border-green-300/15 bg-green-300/5',
  3: 'border-slate-800 bg-slate-950/65',
  4: 'border-slate-800 bg-slate-950/65',
}

export function ProductShot({
  variant,
  className,
  showDisclaimer = false,
}: {
  variant?: ProductShotVariant
  className?: string
  showDisclaimer?: boolean
}) {
  const current = variant ?? 0
  const scene = variant === undefined ? undefined : copy.scenes[variant]

  const stageStatus = (index: number, fallback: string) => {
    if (!scene) return index === current ? 'Votação aberta' : fallback
    if (index < current) return copy.doneLabel
    if (index === current) return scene.stageStatus
    return copy.nextLabel
  }

  return (
    <BrowserFrame className={className} label={scene?.browserLabel ?? copy.browserLabel}>
      <div className="bg-[#0a101c] p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
              {copy.escrowLabel}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">
              {copy.projectTitle}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{copy.projectDescription}</p>
          </div>
          <ShieldCheck aria-hidden className="size-5 text-green-300" />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_0.8fr]">
          <div className="rounded-xl border border-slate-800 bg-slate-950/65 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{copy.stageLabel}</span>
              <span className="rounded-full border border-green-300/25 bg-green-300/10 px-2 py-1 text-green-200">
                {scene?.statusLabel ?? copy.statusLabel}
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {copy.stages.map((stage, index) => (
                <div
                  key={stage.label}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors duration-500 ${index === current ? 'border-cyan-300/35 bg-cyan-300/[0.08]' : 'border-slate-800 bg-slate-950/40'}`}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-500 ${index < current ? 'bg-green-300 text-slate-950' : index === current ? 'bg-cyan-300 text-slate-950' : 'border border-slate-700 text-slate-500'}`}
                  >
                    {index < current ? (
                      <Check aria-hidden className="size-3.5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-slate-200">
                      {stage.label}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {stageStatus(index, stage.status)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div
            key={variant ?? 'overview'}
            className={cn(
              'product-shot-transition rounded-xl border p-4',
              variant === undefined
                ? 'border-slate-800 bg-slate-950/65'
                : panelStyles[variant],
            )}
          >
            {variant === undefined && <OverviewPanel />}
            {variant === 0 && <ProposalScene />}
            {variant === 1 && <FundingScene />}
            {variant === 2 && <ReviewScene />}
            {variant === 3 && <VoteScene />}
            {variant === 4 && <ReleaseScene />}
          </div>
        </div>
        {showDisclaimer && (
          <p className="mt-3 text-right text-[10px] text-slate-600">
            {copy.disclaimer}
          </p>
        )}
      </div>
    </BrowserFrame>
  )
}

function OverviewPanel() {
  return (
    <>
      <CircleDollarSign aria-hidden className="size-5 text-cyan-300" />
      <p className="mt-4 text-sm font-semibold text-white">Custódia por etapa</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        O saldo permanece protegido até a decisão da comunidade.
      </p>
      <div className="mt-6 h-24 rounded-lg border border-dashed border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.08] to-purple-300/[0.06]" />
      <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
        <FileCheck2 aria-hidden className="size-3.5 text-green-300" />
        Evidências registradas
      </div>
    </>
  )
}

// Espelha CreateResearchPreview.
function ProposalScene() {
  const scene = copy.scenes[0]
  const allocated = scene.milestones.reduce((sum, milestone) => sum + milestone.amount, 0)

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase text-cyan-300">{scene.eyebrow}</p>
        <p className="mt-2 text-sm font-semibold text-slate-100">{scene.title}</p>
        <Badge status="AI" label={scene.aiBadge} className="mt-3" />
      </div>
      <StatCard label={scene.totalLabel} value={`${formatUsdc(scene.total)} USDC`} />
      <ProgressBar
        value={Math.round((allocated / scene.total) * 100)}
        label={scene.allocatedLabel}
        tone="green"
      />
      <div className="space-y-2">
        {scene.milestones.map((milestone) => (
          <div
            key={milestone.title}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
          >
            <p className="truncate text-xs font-medium text-slate-200">{milestone.title}</p>
            <span className="font-mono text-xs text-cyan-200">
              {formatUsdc(milestone.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Espelha FundingPanel + ContributorsList.
function FundingScene() {
  const scene = copy.scenes[1]

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase text-green-300">{scene.eyebrow}</p>
        <p className="mt-2 text-sm font-semibold text-slate-100">{scene.title}</p>
      </div>
      <div className="grid gap-3">
        <StatCard label={scene.goalLabel} value={`${formatUsdc(scene.goal)} USDC`} />
        <StatCard
          label={scene.raisedLabel}
          value={`${formatUsdc(scene.raised)} USDC`}
          tone="green"
        />
      </div>
      <ProgressBar
        value={Math.round((scene.raised / scene.goal) * 100)}
        label={scene.progressLabel}
        tone="green"
      />
      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-cyan-200">
            {shortenAddress(scene.lastWallet, 6)}
          </p>
          <p className="truncate text-[10px] text-slate-500">{scene.lastFunder}</p>
        </div>
        <p className="shrink-0 font-mono text-xs text-slate-100">
          {formatUsdc(scene.lastAmount)} USDC
        </p>
      </div>
    </div>
  )
}

// Espelha MilestoneAIReviewCard.
function ReviewScene() {
  const scene = copy.scenes[2]

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-green-200">
          <Bot aria-hidden className="size-4" />
          <p className="text-sm font-medium">{scene.title}</p>
        </div>
        <RiskBadge risk="LOW" />
      </div>
      <p className="mt-3 font-mono text-[10px] text-cyan-300">{scene.milestone}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{scene.summary}</p>
      <div className="mt-4 space-y-3">
        <ProgressBar value={scene.completion} label={scene.completionLabel} tone="green" />
        <ProgressBar value={scene.consistency} label={scene.consistencyLabel} tone="cyan" />
      </div>
      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/55 p-3">
        <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-green-200">
          <CheckCircle2 aria-hidden className="size-3.5" />
          {scene.recommendationLabel}
        </div>
        <p className="text-xs leading-5 text-slate-400">{scene.recommendation}</p>
      </div>
    </div>
  )
}

// Espelha DAOVotingCard.
function VoteScene() {
  const scene = copy.scenes[3]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-200">
            <Vote aria-hidden className="size-4" />
            <p className="text-sm font-semibold">{scene.title}</p>
          </div>
          <p className="text-xs text-slate-400">{scene.milestone}</p>
        </div>
        <Badge status="PENDING_REVIEW" label={scene.badge} className="shrink-0" />
      </div>
      <VoteProgress summary={scene.votes} />
      <VotingEligibilityNotice
        connected
        isContributor={false}
        isCreator
        canVote={false}
        className="text-xs"
      />
    </div>
  )
}

// Espelha ReleaseFundsPanel + TransactionStatusToast.
function ReleaseScene() {
  const scene = copy.scenes[4]
  const signature = `${scene.signature.slice(0, 10)}...${scene.signature.slice(-8)}`

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-200">
        <Coins aria-hidden className="size-4" />
        <p className="text-sm font-semibold">{scene.title}</p>
      </div>
      <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
        <div>
          <p className="text-xs font-medium text-slate-100">{scene.milestone}</p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {formatUsdc(scene.amount)} USDC
          </p>
        </div>
        <Badge status="APPROVED" label={scene.badge} />
      </div>
      <div className="rounded-xl border border-green-300/30 bg-green-300/10 p-3 text-green-100">
        <div className="flex gap-2">
          <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold">{scene.toastTitle}</p>
            <p className="mt-1 text-xs opacity-80">{scene.toastMessage}</p>
            <p className="mt-2 break-all font-mono text-[10px] text-cyan-200 opacity-80">
              {signature} · Explorer
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
