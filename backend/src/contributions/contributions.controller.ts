import { Controller, Get, Param, Query } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { ListContributionsQueryDto } from './dto/list-contributions-query.dto';

@Controller('research/:id')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Get('contributions')
  findByProject(
    @Param('id') projectId: string,
    @Query() query: ListContributionsQueryDto,
  ) {
    return this.contributionsService.findByProject(projectId, query);
  }
}
