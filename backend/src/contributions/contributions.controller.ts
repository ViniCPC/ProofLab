import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { ListContributionsQueryDto } from './dto/list-contributions-query.dto';

@Controller('research/:id')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post('contribute')
  @UseGuards(AuthGuard)
  contribute(
    @Param('id') projectId: string,
    @Body() body: CreateContributionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.contributionsService.contribute(projectId, body, request.user!);
  }

  @Get('contributions')
  findByProject(
    @Param('id') projectId: string,
    @Query() query: ListContributionsQueryDto,
  ) {
    return this.contributionsService.findByProject(projectId, query);
  }
}
