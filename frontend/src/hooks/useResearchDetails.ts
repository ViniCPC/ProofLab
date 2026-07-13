import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useParams } from 'react-router-dom'
import { contributionService } from '@/services/contribution.service'
import { milestoneService } from '@/services/milestone.service'
import { researchService } from '@/services/research.service'
import { demoStore } from '@/store/demoStore'
import { useWalletStore } from '@/store/walletStore'
import type { FundingStats, Milestone, ResearchProject } from '@/types'
import { getApiErrorMessage } from '@/utils/errors'
import { normalizeDecimal } from '@/utils/format'
import { ensureWalletSession } from '@/utils/wallet'

interface ResearchDetailsState {
  project: ResearchProject | null
  funding: FundingStats | null
  milestones: Milestone[]
  loading: boolean
  fundingLoading: boolean
  reviewLoading: boolean
  error: string | null
  actionMessage: string | null
}

interface SubmitMilestoneReviewPayload {
  submittedReport: string
  progress: number
  evidenceText: string
}

const initialState: ResearchDetailsState = {
  project: null,
  funding: null,
  milestones: [],
  loading: true,
  fundingLoading: false,
  reviewLoading: false,
  error: null,
  actionMessage: null,
}

const fallbackError = 'Não foi possível carregar a pesquisa agora.'

function getCurrentMilestoneId(milestones: Milestone[]) {
  return milestones.find((milestone) =>
    ['PENDING_REVIEW', 'SUBMITTED', 'PENDING'].includes(milestone.status),
  )?.id ?? null
}

export function useResearchDetails() {
  const { id } = useParams<{ id: string }>()
  const { walletAddress } = useWalletStore()
  const { signMessage } = useWallet()
  const [state, setState] = useState<ResearchDetailsState>(initialState)

  const loadDetails = useCallback(async () => {
    if (!id) {
      setState({
        ...initialState,
        loading: false,
        error: 'Pesquisa não encontrada.',
      })
      return
    }

    setState((currentState) => ({
      ...currentState,
      loading: true,
      error: null,
    }))

    try {
      const [project, funding, milestones] = await Promise.all([
        researchService.getById(id),
        contributionService.findByProject(id),
        milestoneService.findByProject(id),
      ])

      setState((currentState) => ({
        ...currentState,
        project,
        funding,
        milestones,
        loading: false,
        error: null,
      }))
    } catch (error) {
      setState({
        ...initialState,
        loading: false,
        error: getApiErrorMessage(error, fallbackError),
      })
    }
  }, [id])

  const contribute = useCallback(
    async (amount: string) => {
      if (!id) return

      setState((currentState) => ({
        ...currentState,
        fundingLoading: true,
        actionMessage: null,
        error: null,
      }))

      try {
        await ensureWalletSession(
          walletAddress,
          signMessage,
          'Conecte sua wallet para contribuir.',
        )

        const response = await contributionService.contribute(id, {
          amount: normalizeDecimal(amount),
        })

        setState((currentState) => ({
          ...currentState,
          funding: response.funding,
          fundingLoading: false,
          actionMessage: 'Contribuição registrada com sucesso.',
        }))
      } catch (error) {
        setState((currentState) => ({
          ...currentState,
          fundingLoading: false,
          error: getApiErrorMessage(error, fallbackError),
        }))
      }
    },
    [id, walletAddress, signMessage],
  )

  const submitMilestoneReview = useCallback(
    async (
      milestoneId: string,
      payload: SubmitMilestoneReviewPayload,
    ) => {
      if (!id) return

      demoStore.setSelectedProject(id)
      demoStore.setCurrentMilestone(milestoneId)
      setState((currentState) => ({
        ...currentState,
        reviewLoading: true,
        actionMessage: null,
        error: null,
      }))

      try {
        await ensureWalletSession(
          walletAddress,
          signMessage,
          'Conecte sua wallet para submeter a milestone.',
        )

        const updatedMilestone = await milestoneService.submitReview(
          id,
          milestoneId,
          payload,
        )

        setState((currentState) => ({
          ...currentState,
          milestones: currentState.milestones.map((milestone) =>
            milestone.id === milestoneId ? updatedMilestone : milestone,
          ),
          reviewLoading: false,
          actionMessage:
            'Relatório enviado. A IA analisou a entrega e abriu revisão da comunidade.',
        }))
      } catch (error) {
        setState((currentState) => ({
          ...currentState,
          reviewLoading: false,
          error: getApiErrorMessage(error, fallbackError),
        }))
        throw error
      }
    },
    [id, walletAddress, signMessage],
  )

  useEffect(() => {
    queueMicrotask(() => void loadDetails())
  }, [loadDetails])

  useEffect(() => {
    if (!state.project) return

    demoStore.setSelectedProject(state.project.id)
    demoStore.setCurrentMilestone(getCurrentMilestoneId(state.milestones))
  }, [state.milestones, state.project])

  return {
    ...state,
    contribute,
    submitMilestoneReview,
    refetch: loadDetails,
  }
}
