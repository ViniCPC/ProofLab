import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_CALLS = 5;

@Injectable()
export class AiService {
  private readonly callTimestamps = new Map<string, number[]>();

  constructor(private readonly client: AiClient) {}

  analyzeResearch(dto: AnalyzeResearchDto, actor?: string) {
    this.checkRateLimit(actor);

    return this.client.call(
      RESEARCH_SYSTEM_INSTRUCTION,
      this.buildResearchPrompt(dto),
      'research_analysis',
      RESEARCH_ANALYSIS_SCHEMA,
      isResearchAnalysis,
    );
  }

  analyzeMilestone(dto: AnalyzeMilestoneDto, actor?: string) {
    this.checkRateLimit(actor);

    return this.client.call(
      MILESTONE_SYSTEM_INSTRUCTION,
      this.buildMilestonePrompt(dto),
      'milestone_analysis',
      MILESTONE_ANALYSIS_SCHEMA,
      isMilestoneAnalysis,
    );
  }

  private checkRateLimit(actor?: string) {
    const key = actor ?? 'anonymous';
    const now = Date.now();
    const recentCalls = (this.callTimestamps.get(key) ?? []).filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
    );

    if (recentCalls.length >= RATE_LIMIT_MAX_CALLS) {
      throw new HttpException(
        'Too many AI analysis requests, try again in a minute',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recentCalls.push(now);
    this.callTimestamps.set(key, recentCalls);
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
