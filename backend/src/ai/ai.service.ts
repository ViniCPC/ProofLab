import { Injectable } from '@nestjs/common';
import { AiClient } from './ai.client';
import type { AnalyzeMilestoneDto } from './dto/analyze-milestone.dto';
import type { AnalyzeResearchDto } from './dto/analyze-research.dto';
import {
  isMilestoneAnalysis,
  isResearchAnalysis,
  MILESTONE_ANALYSIS_SCHEMA,
  MILESTONE_SYSTEM_INSTRUCTION,
  RESEARCH_ANALYSIS_SCHEMA,
  RESEARCH_SYSTEM_INSTRUCTION,
} from './ai.types';

export type { ResearchAnalysis, MilestoneAnalysis } from './ai.types';

@Injectable()
export class AiService {
  constructor(private readonly client: AiClient) {}

  analyzeResearch(dto: AnalyzeResearchDto) {
    return this.client.call(
      RESEARCH_SYSTEM_INSTRUCTION,
      this.buildResearchPrompt(dto),
      'research_analysis',
      RESEARCH_ANALYSIS_SCHEMA,
      isResearchAnalysis,
    );
  }

  analyzeMilestone(dto: AnalyzeMilestoneDto) {
    return this.client.call(
      MILESTONE_SYSTEM_INSTRUCTION,
      this.buildMilestonePrompt(dto),
      'milestone_analysis',
      MILESTONE_ANALYSIS_SCHEMA,
      isMilestoneAnalysis,
    );
  }

  private buildResearchPrompt(dto: AnalyzeResearchDto): string {
    return JSON.stringify(
      {
        title: dto.title,
        description: dto.description,
        budget: dto.totalAmount,
        milestones: dto.milestones ?? [],
        scoringRules: {
          innovationScore: 'Integer from 0 to 100',
          feasibilityScore: 'Integer from 0 to 100',
          riskLevel: 'LOW, MEDIUM, or HIGH',
          complexityLevel: 'LOW, MEDIUM, or HIGH',
        },
      },
      null,
      2,
    );
  }

  private buildMilestonePrompt(dto: AnalyzeMilestoneDto): string {
    return JSON.stringify(
      {
        promisedDescription: dto.promisedDescription,
        submittedReport: dto.submittedReport,
        progress: dto.progress,
        evidenceText: dto.evidenceText,
        scoringRules: {
          consistencyScore:
            'Integer from 0 to 100 measuring alignment between promise, report and evidence',
          completionEstimate:
            'Integer from 0 to 100 estimating actual completion based on evidence',
          riskLevel: 'LOW, MEDIUM, or HIGH',
        },
      },
      null,
      2,
    );
  }
}
