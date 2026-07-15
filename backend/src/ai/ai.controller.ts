import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { AiService } from './ai.service';
import { AnalyzeMilestoneDto } from './dto/analyze-milestone.dto';
import { AnalyzeResearchDto } from './dto/analyze-research.dto';

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-research')
  async analyzeResearch(
    @Body() body: AnalyzeResearchDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.aiService.analyzeResearch(body, request.user!.walletAddress);
  }

  @Post('analyze-milestone')
  async analyzeMilestone(
    @Body() body: AnalyzeMilestoneDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.aiService.analyzeMilestone(body, request.user!.walletAddress);
  }
}
