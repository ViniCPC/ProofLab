import { api } from './api'
import type { MilestoneAIReview, ResearchAIAnalysis } from '@/types/ai'
import type { Milestone } from '@/types/milestone'
import type { ResearchProject } from '@/types/research'

function toResearchAnalysis(project: ResearchProject): ResearchAIAnalysis {
  return {
    aiSummary: project.aiSummary,
    innovationScore: project.innovationScore,
    feasibilityScore: project.feasibilityScore,
    riskLevel: project.riskLevel,
    complexityLevel: project.complexityLevel,
  }
}

function toMilestoneReview(milestone: Milestone): MilestoneAIReview {
  return {
    aiSummary: milestone.aiSummary,
    consistencyScore: milestone.consistencyScore,
    completionEstimate: milestone.completionEstimate,
    aiRiskLevel: milestone.aiRiskLevel,
  }
}

export const aiService = {
  getResearchAnalysis: async (projectId: string) => {
    const project = await api.get<ResearchProject>(`/research/${projectId}`)
    return toResearchAnalysis(project)
  },

  getMilestoneReview: (milestones: Milestone[], milestoneId: string) => {
    const milestone = milestones.find((item) => item.id === milestoneId)

    if (!milestone) {
      throw {
        statusCode: 404,
        message: 'Milestone não encontrada.',
      }
    }

    return toMilestoneReview(milestone)
  },
}
