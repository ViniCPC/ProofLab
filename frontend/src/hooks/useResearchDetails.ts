import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useParams } from 'react-router-dom'
import { contributionService } from '@/services/contribution.service'
import { milestoneService } from '@/services/milestone.service'
import { researchService } from '@/services/research.service'
import { transactionStore } from '@/store/transactionStore'
import { useWalletStore } from '@/store/walletStore'
import type { FundingStats, Milestone, ResearchProject } from '@/types'
import { getApiErrorMessage } from '@/utils/errors'
import { ensureWalletSession } from '@/utils/wallet'

interface ResearchDetailsState {
  project: ResearchProject | null
  funding: FundingStats | null
  milestones: Milestone[]
  loading: boolean
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
  reviewLoading: false,
  error: null,
  actionMessage: null,
}

const fallbackError = 'Não foi possível carregar a pesquisa agora.'

function getCurrentMilestoneId(milestones: Milestone[]) {
  return (
    milestones.find((milestone) =>
      ['PENDING_REVIEW', 'SUBMITTED', 'PENDING'].includes(milestone.status),
    )?.id ?? null
  )
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
      // Keep what is already on screen; a failed refetch shows as a page error.
      setState((currentState) => ({
        ...currentState,
        loading: false,
        error: getApiErrorMessage(error, fallbackError),
      }))
    }
  }, [id])

  const submitMilestoneReview = useCallback(
    async (milestoneId: string, payload: SubmitMilestoneReviewPayload) => {
      if (!id) return

      transactionStore.setSelectedProject(id)
      transactionStore.setCurrentMilestone(milestoneId)
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
          'Conecte sua wallet para enviar o relatório.',
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
            'Relatório enviado e analisado pela IA. Confirme na wallet para abrir a votação.',
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

    transactionStore.setSelectedProject(state.project.id)
    transactionStore.setCurrentMilestone(getCurrentMilestoneId(state.milestones))
  }, [state.milestones, state.project])

  return {
    ...state,
    submitMilestoneReview,
    refetch: loadDetails,
  }
}
