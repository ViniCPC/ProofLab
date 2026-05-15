import { api } from './api'
import type {
  CreateResearchPayload,
  ResearchListResponse,
  ResearchProject,
} from '@/types/research'

export const researchService = {
  list: (page = 1, limit = 10) =>
    api.get<ResearchListResponse>(`/research?page=${page}&limit=${limit}`),

  getById: (id: string) => api.get<ResearchProject>(`/research/${id}`),

  create: (payload: CreateResearchPayload) =>
    api.post<ResearchProject>('/research', payload),
}
