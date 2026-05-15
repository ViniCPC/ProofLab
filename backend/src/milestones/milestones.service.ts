import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '../users/users.service';
import type { CreateMilestoneDto } from './dto/create-milestone.dto';
import type { SubmitMilestoneReviewDto } from './dto/submit-milestone-review.dto';
import type { SubmitOnChainDto } from './dto/submit-on-chain.dto';
import type { VoteOnChainDto } from '../votes/dto/vote-on-chain.dto';

@Injectable()
export class MilestonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly blockchain: BlockchainService,
  ) {}

  async create(projectId: string, dto: CreateMilestoneDto, user: PublicUser) {
    const project = await this.findProjectOrThrow(projectId);

    if (project.creatorId !== user.id) {
      throw new ForbiddenException(
        'Only the project creator can add milestones',
      );
    }

    try {
      return await this.prisma.milestone.create({
        data: {
          title: dto.title,
          description: dto.description,
          amount: dto.amount,
          order: dto.order,
          projectId: project.id,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Milestone order already exists for this project',
        );
      }

      throw error;
    }
  }

  async findByProject(projectId: string) {
    await this.findProjectOrThrow(projectId);

    return this.prisma.milestone.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
  }

  async submitReview(
    projectId: string,
    milestoneId: string,
    dto: SubmitMilestoneReviewDto,
    user: PublicUser,
  ) {
    const project = await this.findProjectOrThrow(projectId);

    if (project.creatorId !== user.id) {
      throw new ForbiddenException(
        'Only the project creator can submit milestone reviews',
      );
    }

    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      select: {
        id: true,
        description: true,
        status: true,
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.status !== 'PENDING' && milestone.status !== 'REJECTED') {
      throw new BadRequestException(
        'Only PENDING or REJECTED milestones can be submitted for review',
      );
    }

    await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        submittedReport: dto.submittedReport,
        submittedAt: new Date(),
      },
    });

    const analysis = await this.aiService.analyzeMilestone({
      promisedDescription: milestone.description,
      submittedReport: dto.submittedReport,
      progress: dto.progress,
      evidenceText: dto.evidenceText,
    });

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        aiSummary: analysis.summary,
        consistencyScore: analysis.consistencyScore,
        completionEstimate: analysis.completionEstimate,
        aiRiskLevel: analysis.riskLevel,
        status: 'PENDING_REVIEW',
      },
    });
  }

  async updateStatus(
    projectId: string,
    milestoneId: string,
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED',
    user: PublicUser,
  ) {
    const project = await this.findProjectOrThrow(projectId);

    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      select: { id: true, status: true },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (status === 'SUBMITTED') {
      if (project.creatorId !== user.id) {
        throw new ForbiddenException(
          'Only the project creator can submit milestones',
        );
      }
      if (milestone.status !== 'PENDING') {
        throw new BadRequestException(
          'Only PENDING milestones can be submitted',
        );
      }
    } else {
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException(
          'Only admins can approve or reject milestones',
        );
      }
      if (
        milestone.status !== 'SUBMITTED' &&
        milestone.status !== 'PENDING_REVIEW'
      ) {
        throw new BadRequestException(
          'Only submitted milestones can be approved or rejected',
        );
      }
    }

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status },
    });
  }

  async submitOnChain(
    projectId: string,
    milestoneId: string,
    dto: SubmitOnChainDto,
    user: PublicUser,
  ) {
    const project = await this.findProjectOrThrow(projectId);

    if (project.creatorId !== user.id) {
      throw new ForbiddenException(
        'Only the project creator can submit milestones on-chain',
      );
    }

    if (!project.onChainProjectAddress) {
      throw new BadRequestException(
        'Project has not been registered on-chain yet',
      );
    }

    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      select: { id: true, order: true, status: true, onChainMilestoneAddress: true },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only APPROVED milestones can be submitted on-chain',
      );
    }

    const onChainMilestoneAddress = this.blockchain.getMilestonePda(
      project.onChainProjectAddress,
      milestone.order,
    );

    const transaction = await this.blockchain.submitMilestoneOnChain(
      user.walletAddress,
      project.onChainProjectAddress,
      milestone.order,
      dto.votingDurationSeconds,
    );

    await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { onChainMilestoneAddress },
    });

    return {
      transaction: transaction.toString('base64'),
      onChainMilestoneAddress,
    };
  }

  async voteOnChain(
    projectId: string,
    milestoneId: string,
    dto: VoteOnChainDto,
    user: PublicUser,
  ) {
    const project = await this.findProjectOrThrow(projectId);

    if (!project.onChainProjectAddress) {
      throw new BadRequestException(
        'Project has not been registered on-chain yet',
      );
    }

    if (project.creatorId === user.id) {
      throw new ForbiddenException(
        'Project creator cannot vote on their own milestones',
      );
    }

    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      select: { id: true, order: true, onChainMilestoneAddress: true },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (!milestone.onChainMilestoneAddress) {
      throw new BadRequestException(
        'Milestone has not been submitted on-chain yet',
      );
    }

    const transaction = await this.blockchain.voteMilestoneOnChain(
      user.walletAddress,
      project.onChainProjectAddress,
      milestone.order,
      dto.approve,
    );

    return { transaction: transaction.toString('base64') };
  }

  async releaseOnChain(
    projectId: string,
    milestoneId: string,
    user: PublicUser,
  ) {
    const project = await this.findProjectOrThrow(projectId);

    if (project.creatorId !== user.id) {
      throw new ForbiddenException(
        'Only the project creator can release funds on-chain',
      );
    }

    if (!project.onChainProjectAddress) {
      throw new BadRequestException(
        'Project has not been registered on-chain yet',
      );
    }

    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      select: { id: true, order: true, status: true, onChainMilestoneAddress: true },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only APPROVED milestones can have funds released',
      );
    }

    if (!milestone.onChainMilestoneAddress) {
      throw new BadRequestException(
        'Milestone has not been submitted on-chain yet',
      );
    }

    const transaction = await this.blockchain.releaseFundsOnChain(
      user.walletAddress,
      project.onChainProjectAddress,
      milestone.order,
    );

    return { transaction: transaction.toString('base64') };
  }

  private async findProjectOrThrow(projectId: string) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        creatorId: true,
        onChainProjectAddress: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Research project not found');
    }

    return project;
  }
}
