export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ResearchAnalysis {
  summary: string;
  innovationScore: number;
  feasibilityScore: number;
  riskLevel: RiskLevel;
  complexityLevel: RiskLevel;
  recommendation: string;
}

export interface MilestoneAnalysis {
  summary: string;
  consistencyScore: number;
  completionEstimate: number;
  riskLevel: RiskLevel;
  recommendation: string;
}

export interface OpenAiResponse {
  status?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: { message?: string } | null;
}

export const RESEARCH_SYSTEM_INSTRUCTION =
  'You are an expert research funding reviewer. Analyze projects before funding. Return only the requested JSON structure. Use practical, investor-facing language in Portuguese.';

export const MILESTONE_SYSTEM_INSTRUCTION =
  'You are an expert research milestone reviewer. Compare the promised milestone with the submitted report, progress and textual evidence. Return only the requested JSON structure. Use practical, reviewer-facing language in Portuguese.';

export const RESEARCH_ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'innovationScore',
    'feasibilityScore',
    'riskLevel',
    'complexityLevel',
    'recommendation',
  ],
  properties: {
    summary: {
      type: 'string',
      description: 'Concise project summary in Portuguese.',
    },
    innovationScore: { type: 'integer', minimum: 0, maximum: 100 },
    feasibilityScore: { type: 'integer', minimum: 0, maximum: 100 },
    riskLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
    complexityLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
    recommendation: {
      type: 'string',
      description:
        'Funding recommendation in Portuguese, including what to improve before funding if needed.',
    },
  },
} as const;

export const MILESTONE_ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'consistencyScore',
    'completionEstimate',
    'riskLevel',
    'recommendation',
  ],
  properties: {
    summary: {
      type: 'string',
      description:
        'Concise milestone review summary in Portuguese, grounded in the provided evidence.',
    },
    consistencyScore: { type: 'integer', minimum: 0, maximum: 100 },
    completionEstimate: { type: 'integer', minimum: 0, maximum: 100 },
    riskLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
    recommendation: {
      type: 'string',
      description:
        'Review recommendation in Portuguese, including whether more evidence is needed.',
    },
  },
} as const;

function isValidRiskLevel(value: unknown): value is RiskLevel {
  return value === 'LOW' || value === 'MEDIUM' || value === 'HIGH';
}

function isValidScore(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 100
  );
}

export function isResearchAnalysis(value: unknown): value is ResearchAnalysis {
  if (!value || typeof value !== 'object') return false;

  const a = value as Partial<ResearchAnalysis>;

  return (
    typeof a.summary === 'string' &&
    isValidScore(a.innovationScore) &&
    isValidScore(a.feasibilityScore) &&
    isValidRiskLevel(a.riskLevel) &&
    isValidRiskLevel(a.complexityLevel) &&
    typeof a.recommendation === 'string'
  );
}

export function isMilestoneAnalysis(value: unknown): value is MilestoneAnalysis {
  if (!value || typeof value !== 'object') return false;

  const a = value as Partial<MilestoneAnalysis>;

  return (
    typeof a.summary === 'string' &&
    isValidScore(a.consistencyScore) &&
    isValidScore(a.completionEstimate) &&
    isValidRiskLevel(a.riskLevel) &&
    typeof a.recommendation === 'string'
  );
}
