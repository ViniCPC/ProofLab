import { useState } from 'react'
import { milestoneService } from '@/services/milestone.service'
import { getApiErrorMessage } from '@/utils/errors'

interface UseReanalyzeMilestoneOptions {
  projectId?: string
  onReanalyzed?: () => Promise<void> | void
}

export function useReanalyzeMilestone({
  projectId,
  onReanalyzed,
}: UseReanalyzeMilestoneOptions) {
  const [loadingMilestoneId, setLoadingMilestoneId] = useState<string | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  async function reanalyze(milestoneId: string) {
    if (!projectId) return

    setLoadingMilestoneId(milestoneId)
    setError(null)

    try {
      await milestoneService.reanalyze(projectId, milestoneId)
      await onReanalyzed?.()
    } catch (caughtError) {
      setError(
        getApiErrorMessage(
          caughtError,
          'Não foi possível reanalisar a milestone.',
        ),
      )
    } finally {
      setLoadingMilestoneId(null)
    }
  }

  return { loadingMilestoneId, error, reanalyze }
}
