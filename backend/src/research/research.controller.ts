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
import { CreateResearchDto } from './dto/create-research.dto';
import { ListResearchQueryDto } from './dto/list-research-query.dto';
import { ResearchService } from './research.service';

@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() body: CreateResearchDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.researchService.create(body, request.user!);
  }

  @Get()
  findAll(@Query() query: ListResearchQueryDto) {
    return this.researchService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.researchService.findById(id);
  }
}
