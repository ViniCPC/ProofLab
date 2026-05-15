import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { AnalyzeMilestoneDto } from './dto/analyze-milestone.dto';
import { AnalyzeResearchDto } from './dto/analyze-research.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-research')
  async analyzeResearch(@Body() body: AnalyzeResearchDto) {
    return this.aiService.analyzeResearch(body);
  }

  @Post('analyze-milestone')
  async analyzeMilestone(@Body() body: AnalyzeMilestoneDto) {
    return this.aiService.analyzeMilestone(body);
  }
}
