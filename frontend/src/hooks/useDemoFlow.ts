import { useCallback, useEffect, useState } from 'react'
import { demoService } from '@/services/demo.service'
import type { DemoScenario, DemoSummary } from '@/types/demo'
import { getApiErrorMessage } from '@/utils/errors'

interface DemoFlowState {
  summary: DemoSummary | null
  loading: boolean
  activeAction: DemoScenario | 'seed' | null
  error: string | null
  message: string | null
}

const initialState: DemoFlowState = {
  summary: null,
  loading: true,
  activeAction: null,
  error: null,
  message: null,
}

const scenarioMessages: Record<DemoScenario, string> = {
  baseline: 'Seed restaurado para o começo da demo.',
  funding: 'Projeto pronto para demonstrar funding.',
  'pending-review': 'Milestone colocada em revisão da comunidade.',
  approved: 'Votação simulada como aprovada.',
  cancelled: 'Projeto cancelado para demonstrar refund.',
  completed: 'Projeto marcado como concluído para fechar a demo.',
}

export function useDemoFlow() {
  const [state, setState] = useState<DemoFlowState>(initialState)

  const loadSummary = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))

    try {
      const summary = await demoService.getSummary()
      setState((current) => ({
        ...current,
        summary,
        loading: false,
      }))
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: getApiErrorMessage(error, 'Não foi possível carregar a demo.'),
      }))
    }
  }, [])

  const seed = useCallback(async () => {
    setState((current) => ({
      ...current,
      activeAction: 'seed',
      error: null,
      message: null,
    }))

    try {
      const summary = await demoService.seed()
      setState((current) => ({
        ...current,
        summary,
        activeAction: null,
        message: 'Seed recriado com sucesso.',
      }))
    } catch (error) {
      setState((current) => ({
        ...current,
        activeAction: null,
        error: getApiErrorMessage(error, 'Não foi possível recriar o seed.'),
      }))
    }
  }, [])

  const applyScenario = useCallback(async (scenario: DemoScenario) => {
    setState((current) => ({
      ...current,
      activeAction: scenario,
      error: null,
      message: null,
    }))

    try {
      const summary = await demoService.applyScenario(scenario)
      setState((current) => ({
        ...current,
        summary,
        activeAction: null,
        message: scenarioMessages[scenario],
      }))
    } catch (error) {
      setState((current) => ({
        ...current,
        activeAction: null,
        error: getApiErrorMessage(error, 'Não foi possível aplicar o cenário.'),
      }))
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => void loadSummary())
  }, [loadSummary])

  return {
    ...state,
    seed,
    applyScenario,
    reload: loadSummary,
  }
}
