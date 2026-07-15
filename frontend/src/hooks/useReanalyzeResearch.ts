import { useState } from 'react'
import { researchService } from '@/services/research.service'
import { getApiErrorMessage } from '@/utils/errors'

interface UseReanalyzeResearchOptions {
  projectId?: string
  onReanalyzed?: () => Promise<void> | void
}

export function useReanalyzeResearch({
  projectId,
  onReanalyzed,
}: UseReanalyzeResearchOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function reanalyze() {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      await researchService.reanalyze(projectId)
      await onReanalyzed?.()
    } catch (caughtError) {
      setError(
        getApiErrorMessage(
          caughtError,
          'Não foi possível reanalisar a pesquisa.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, reanalyze }
}
