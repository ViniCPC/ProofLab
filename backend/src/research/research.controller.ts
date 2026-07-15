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
import { ConfirmTransactionDto } from './dto/confirm-transaction.dto';
import { CreateResearchDto } from './dto/create-research.dto';
import { FundOnChainDto } from './dto/fund-on-chain.dto';
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

  @Post(':id/create-on-chain')
  @UseGuards(AuthGuard)
  createOnChain(
    @Param('id') projectId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.researchService.createOnChain(projectId, request.user!);
  }

  @Post(':id/fund-on-chain')
  @UseGuards(AuthGuard)
  fundOnChain(
    @Param('id') projectId: string,
    @Body() body: FundOnChainDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.researchService.fundOnChain(projectId, body, request.user!);
  }

  @Post(':id/claim-refund')
  @UseGuards(AuthGuard)
  claimRefund(
    @Param('id') projectId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.researchService.claimRefund(projectId, request.user!);
  }

  @Post(':id/cancel-on-chain')
  @UseGuards(AuthGuard)
  cancelOnChain(
    @Param('id') projectId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.researchService.cancelOnChain(projectId, request.user!);
  }

  @Post(':id/reanalyze')
  @UseGuards(AuthGuard)
  reanalyze(
    @Param('id') projectId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.researchService.reanalyze(projectId, request.user!);
  }

  @Post(':id/on-chain/confirm-transaction')
  @UseGuards(AuthGuard)
  confirmTransaction(
    @Param('id') projectId: string,
    @Body() body: ConfirmTransactionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.researchService.confirmTransaction(
      projectId,
      body,
      request.user!,
    );
  }
}
