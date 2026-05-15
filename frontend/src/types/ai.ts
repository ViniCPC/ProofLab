export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface ResearchAIAnalysis {
  aiSummary: string | null
  innovationScore: number | null
  feasibilityScore: number | null
  riskLevel: RiskLevel | null
  complexityLevel: RiskLevel | null
}

export interface MilestoneAIReview {
  aiSummary: string | null
  consistencyScore: number | null
  completionEstimate: number | null
  aiRiskLevel: RiskLevel | null
}
