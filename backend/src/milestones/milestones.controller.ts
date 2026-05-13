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
import { CreateMilestoneDto } from './dto/create-milestone.dto';
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
}
