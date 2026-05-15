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
import { VoteOnChainDto } from './dto/vote-on-chain.dto';
import { VotesService } from './votes.service';

@Controller('research/:projectId/milestones/:milestoneId')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post('votes')
  @UseGuards(AuthGuard)
  vote(
    @Param('projectId') projectId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: CreateVoteDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.votesService.vote(projectId, milestoneId, body, request.user!);
  }

  @Get('votes')
  findByMilestone(
    @Param('projectId') projectId: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    return this.votesService.findByMilestone(projectId, milestoneId);
  }

  @Post('vote-on-chain')
  @UseGuards(AuthGuard)
  voteOnChain(
    @Param('projectId') projectId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: VoteOnChainDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.votesService.voteOnChain(
      projectId,
      milestoneId,
      body,
      request.user!,
    );
  }
}
