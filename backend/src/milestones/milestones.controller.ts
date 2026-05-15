import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { CreateMilestoneOnChainDto } from './dto/create-milestone-on-chain.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { SubmitMilestoneReviewDto } from './dto/submit-milestone-review.dto';
import { SubmitOnChainDto } from './dto/submit-on-chain.dto';
import { UpdateMilestoneStatusDto } from './dto/update-milestone-status.dto';
import { MilestonesService } from './milestones.service';

@Controller('research/:id/milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Param('id') projectId: string,
    @Body() body: CreateMilestoneDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.milestonesService.create(projectId, body, request.user!);
  }

  @Post(':milestoneId/submit-review')
  @UseGuards(AuthGuard)
  submitReview(
    @Param('id') projectId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: SubmitMilestoneReviewDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.milestonesService.submitReview(
      projectId,
      milestoneId,
      body,
      request.user!,
    );
  }

  @Get()
  findByProject(@Param('id') projectId: string) {
    return this.milestonesService.findByProject(projectId);
  }

  @Patch(':milestoneId/status')
  @UseGuards(AuthGuard)
  updateStatus(
    @Param('id') projectId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: UpdateMilestoneStatusDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.milestonesService.updateStatus(
      projectId,
      milestoneId,
      body.status,
      request.user!,
    );
  }

  @Post(':milestoneId/submit-on-chain')
  @UseGuards(AuthGuard)
  submitOnChain(
    @Param('id') projectId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: SubmitOnChainDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.milestonesService.submitOnChain(
      projectId,
      milestoneId,
      body,
      request.user!,
    );
  }

  @Post(':milestoneId/create-on-chain')
  @UseGuards(AuthGuard)
  createOnChain(
    @Param('id') projectId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: CreateMilestoneOnChainDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.milestonesService.createOnChain(
      projectId,
      milestoneId,
      body,
      request.user!,
    );
  }

  @Post(':milestoneId/release-on-chain')
  @UseGuards(AuthGuard)
  releaseOnChain(
    @Param('id') projectId: string,
    @Param('milestoneId') milestoneId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.milestonesService.releaseOnChain(
      projectId,
      milestoneId,
      request.user!,
    );
  }
}
