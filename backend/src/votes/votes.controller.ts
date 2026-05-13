import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { CreateVoteDto } from './dto/create-vote.dto';
import { VotesService } from './votes.service';

@Controller('research/:projectId/milestones/:milestoneId/votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @UseGuards(AuthGuard)
  vote(
    @Param('projectId') projectId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: CreateVoteDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.votesService.vote(projectId, milestoneId, body, request.user!);
  }

  @Get()
  findByMilestone(
    @Param('projectId') projectId: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    return this.votesService.findByMilestone(projectId, milestoneId);
  }
}
