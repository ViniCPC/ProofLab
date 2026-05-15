import { useCallback, useEffect, useState } from 'react'
import { contributionService } from '@/services/contribution.service'
import { researchService } from '@/services/research.service'
import type { FundingStats, PaginationMeta, ResearchProject } from '@/types'
import { getApiErrorMessage } from '@/utils/errors'

interface ResearchListState {
  projects: ResearchProject[]
  fundingByProjectId: Record<string, FundingStats | null>
  meta: PaginationMeta | null
  loading: boolean
  error: string | null
}

const initialState: ResearchListState = {
  projects: [],
  fundingByProjectId: {},
  meta: null,
  loading: true,
  error: null,
}

async function getFundingByProjectId(projects: ResearchProject[]) {
  const fundingResults = await Promise.allSettled(
    projects.map((project) => contributionService.findByProject(project.id)),
  )

  return projects.reduce<Record<string, FundingStats | null>>(
    (fundingMap, project, index) => {
      const result = fundingResults[index]
      fundingMap[project.id] =
        result.status === 'fulfilled' ? result.value : null
      return fundingMap
    },
    {},
  )
}

export function useResearchList(page = 1, limit = 9) {
  const [state, setState] = useState<ResearchListState>(initialState)

  const loadResearch = useCallback(async () => {
    setState((currentState) => ({
      ...currentState,
      loading: true,
      error: null,
    }))

    try {
      const researchList = await researchService.list(page, limit)
      const fundingByProjectId = await getFundingByProjectId(researchList.data)

      setState({
        projects: researchList.data,
        fundingByProjectId,
        meta: researchList.meta,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        projects: [],
        fundingByProjectId: {},
        meta: null,
        loading: false,
        error: getApiErrorMessage(
          error,
          'Não foi possível carregar as pesquisas agora.',
        ),
      })
    }
  }, [limit, page])

  useEffect(() => {
    queueMicrotask(() => void loadResearch())
  }, [loadResearch])

  return {
    ...state,
    refetch: loadResearch,
  }
}
