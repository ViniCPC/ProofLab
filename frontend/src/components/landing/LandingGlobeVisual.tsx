import { lazy, Suspense } from 'react'
import { useGlobeFallback } from '@/hooks/useGlobeFallback'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlobeErrorBoundary } from './GlobeErrorBoundary'
import { GlobeFallback } from './GlobeFallback'
import { LandingStats } from './LandingStats'

const ScienceGlobe = lazy(() =>
  import('./ScienceGlobe').then((module) => ({
    default: module.ScienceGlobe,
  })),
)

export function LandingGlobeVisual() {
  const { markGlobeReady, shouldUseFallback } = useGlobeFallback()
  const fallback = <GlobeFallback />

  return (
    <GlassPanel
      tone="cyan"
      className="min-h-[420px] rounded-xl bg-slate-950/56 shadow-[0_0_90px_-44px_rgba(34,211,238,0.9)]"
    >
      {shouldUseFallback ? (
        fallback
      ) : (
        <GlobeErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <ScienceGlobe onReady={markGlobeReady} />
          </Suspense>
        </GlobeErrorBoundary>
      )}
      <LandingStats />
    </GlassPanel>
  )
}
