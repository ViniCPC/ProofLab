import { api } from './api'
import type { DemoScenario, DemoSummary } from '@/types/demo'

export const demoService = {
  getSummary: () => api.get<DemoSummary>('/demo'),

  seed: () => api.post<DemoSummary>('/demo/seed', {}),

  applyScenario: (scenario: DemoScenario) =>
    api.post<DemoSummary>('/demo/scenario', { scenario }),
}
