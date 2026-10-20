import { useCallback, useEffect, useState } from 'react'
import { contributionService } from '@/services/contribution.service'
import { researchService } from '@/services/research.service'
import type { FundingStats, ResearchProject, ResearchStats } from '@/types'

interface LandingStatsState {
  stats: ResearchStats | null
  loading: boolean
}

const initialStats: LandingStatsState = { stats: null, loading: true }

export function useLandingStats() {
  const [state, setState] = useState(initialStats)

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true }))
    try {
      setState({ stats: await researchService.stats(), loading: false })
    } catch {
      setState({ stats: null, loading: false })
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => void load())
  }, [load])

  return { ...state, refetch: load }
}

interface FeaturedProjectState {
  project: ResearchProject | null
  funding: FundingStats | null
  loading: boolean
}

export function useFeaturedProject() {
  const [state, setState] = useState<FeaturedProjectState>({
    project: null,
    funding: null,
    loading: true,
  })

  useEffect(() => {
    let active = true
    void researchService
      .list(1, 1)
      .then(async ({ data }) => {
        const project = data[0] ?? null
        const funding = project
          ? await contributionService.findByProject(project.id)
          : null
        if (active) setState({ project, funding, loading: false })
      })
      .catch(() => {
        if (active) setState({ project: null, funding: null, loading: false })
      })

    return () => {
      active = false
    }
  }, [])

  return state
}
