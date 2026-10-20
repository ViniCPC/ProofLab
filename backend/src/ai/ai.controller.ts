import {
  MilestoneAnalysisResponseDto,
  ResearchAnalysisResponseDto,
} from './dto/analysis-response.dto';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { AiService } from './ai.service';
import { AnalyzeMilestoneDto } from './dto/analyze-milestone.dto';
import { AnalyzeResearchDto } from './dto/analyze-research.dto';

@Controller('ai')
@ApiBearerAuth('wallet-jwt')
@UseGuards(AuthGuard, ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60_000 } })
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-research')
  @ApiCreatedResponse({ type: ResearchAnalysisResponseDto })
  async analyzeResearch(
    @Body() body: AnalyzeResearchDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.aiService.analyzeResearch(body, request.user!.walletAddress);
  }

  @Post('analyze-milestone')
  @ApiCreatedResponse({ type: MilestoneAnalysisResponseDto })
  async analyzeMilestone(
    @Body() body: AnalyzeMilestoneDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.aiService.analyzeMilestone(body, request.user!.walletAddress);
  }
}
