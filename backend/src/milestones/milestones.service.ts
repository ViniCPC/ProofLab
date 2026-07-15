import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { toUsdcBaseUnits } from '../blockchain/blockchain.utils';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '../users/users.service';
import type { CreateMilestoneOnChainDto } from './dto/create-milestone-on-chain.dto';
import type { CreateMilestoneDto } from './dto/create-milestone.dto';
import type { SubmitMilestoneReviewDto } from './dto/submit-milestone-review.dto';
import type { SubmitOnChainDto } from './dto/submit-on-chain.dto';

const OnChainOperation = {
  CREATE_MILESTONE: 'CREATE_MILESTONE',
  SUBMIT_MILESTONE: 'SUBMIT_MILESTONE',
  FINALIZE_VOTE: 'FINALIZE_VOTE',
  RELEASE_FUNDS: 'RELEASE_FUNDS',
} as const;

type OnChainOperation =
  (typeof OnChainOperation)[keyof typeof OnChainOperation];

interface CreatePendingTransactionInput {
  projectId: string;
  milestoneId: string;
  userId: string;
  wallet: string;
  operation: OnChainOperation;
  expectedProjectAddress: string;
  expectedEscrowVaultAddress?: string | null;
  expectedMilestoneAddress?: string | null;
}

@Injectable()
export class MilestonesService {
  private readonly logger = new Logger(MilestonesService.name);

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

    const milestoneCount = await this.prisma.milestone.count({
      where: { projectId },
    });
    const expectedOrder = milestoneCount + 1;

    if (dto.order !== expectedOrder) {
      throw new BadRequestException(
        `Next milestone order must be ${expectedOrder}`,
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
        submittedProgress: dto.progress,
        submittedEvidence: dto.evidenceText,
        submittedAt: new Date(),
      },
    });

    const analysis = await this.runMilestoneAnalysis(
      {
        promisedDescription: milestone.description,
        submittedReport: dto.submittedReport,
        progress: dto.progress,
        evidenceText: dto.evidenceText,
      },
      user.walletAddress,
    );

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...analysis,
        status: 'PENDING_REVIEW',
      },
    });
  }

  async reanalyze(projectId: string, milestoneId: string, user: PublicUser) {
    const project = await this.findProjectOrThrow(projectId);

    if (project.creatorId !== user.id) {
      throw new ForbiddenException(
        'Only the project creator can request a new AI analysis',
      );
    }

    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      select: {
        id: true,
        description: true,
        submittedReport: true,
        submittedProgress: true,
        submittedEvidence: true,
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (
      !milestone.submittedReport ||
      milestone.submittedProgress === null ||
      !milestone.submittedEvidence
    ) {
      throw new BadRequestException(
        'Milestone has not been submitted for review yet',
      );
    }

    const analysis = await this.runMilestoneAnalysis(
      {
        promisedDescription: milestone.description,
        submittedReport: milestone.submittedReport,
        progress: milestone.submittedProgress,
        evidenceText: milestone.submittedEvidence,
      },
      user.walletAddress,
    );

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data:
        analysis.aiStatus === 'FAILED' ? { aiStatus: 'FAILED' } : analysis,
    });
  }

  private async runMilestoneAnalysis(
    input: {
      promisedDescription: string;
      submittedReport: string;
      progress: number;
      evidenceText: string;
    },
    actor: string,
  ) {
    try {
      const analysis = await this.aiService.analyzeMilestone(input, actor);

      return {
        aiStatus: 'COMPLETED' as const,
        aiSummary: analysis.summary,
        aiRecommendation: analysis.recommendation,
        consistencyScore: analysis.consistencyScore,
        completionEstimate: analysis.completionEstimate,
        aiRiskLevel: analysis.riskLevel,
      };
    } catch (error) {
      this.logger.warn(
        `AI milestone analysis failed, keeping milestone in review without it: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return {
        aiStatus: 'FAILED' as const,
        aiSummary: null,
        aiRecommendation: null,
        consistencyScore: null,
        completionEstimate: null,
        aiRiskLevel: null,
      };
    }
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
      select: {
        id: true,
        order: true,
        status: true,
        onChainMilestoneAddress: true,
      },
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

    if (!milestone.onChainMilestoneAddress) {
      throw new BadRequestException(
        'Milestone has not been created on-chain yet',
      );
    }

    const transaction = await this.blockchain.submitMilestoneOnChain(
      user.walletAddress,
      project.onChainProjectAddress,
      milestone.order,
      dto.votingDurationSeconds,
    );

    const pendingTransaction = await this.createPendingTransaction({
      projectId,
      milestoneId,
      userId: user.id,
      wallet: user.walletAddress,
      operation: OnChainOperation.SUBMIT_MILESTONE,
      expectedProjectAddress: project.onChainProjectAddress,
      expectedMilestoneAddress: onChainMilestoneAddress,
    });

    return {
      requestId: pendingTransaction.id,
      transaction: transaction.toString('base64'),
      onChainMilestoneAddress,
    };
  }

  async createOnChain(
    projectId: string,
    milestoneId: string,
    dto: CreateMilestoneOnChainDto,
    user: PublicUser,
  ) {
    const project = await this.findProjectOrThrow(projectId);

    if (project.creatorId !== user.id) {
      throw new ForbiddenException(
        'Only the project creator can create milestones on-chain',
      );
    }

    if (!project.onChainProjectAddress) {
      throw new BadRequestException(
        'Project has not been registered on-chain yet',
      );
    }

    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      select: {
        id: true,
        amount: true,
        order: true,
        onChainMilestoneAddress: true,
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.onChainMilestoneAddress) {
      throw new ConflictException('Milestone is already created on-chain');
    }

    const deadline =
      dto.deadlineUnixTimestamp ??
      Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    const onChainMilestoneAddress = this.blockchain.getMilestonePda(
      project.onChainProjectAddress,
      milestone.order,
    );
    const transaction = await this.blockchain.createMilestoneOnChain(
      user.walletAddress,
      project.onChainProjectAddress,
      milestone.order,
      toUsdcBaseUnits(milestone.amount),
      deadline,
    );

    const pendingTransaction = await this.createPendingTransaction({
      projectId,
      milestoneId,
      userId: user.id,
      wallet: user.walletAddress,
      operation: OnChainOperation.CREATE_MILESTONE,
      expectedProjectAddress: project.onChainProjectAddress,
      expectedMilestoneAddress: onChainMilestoneAddress,
    });

    return {
      requestId: pendingTransaction.id,
      transaction: transaction.toString('base64'),
      onChainMilestoneAddress,
    };
  }

  async finalizeVoteOnChain(
    projectId: string,
    milestoneId: string,
    user: PublicUser,
  ) {
    const project = await this.findProjectOrThrow(projectId);

    if (!project.onChainProjectAddress) {
      throw new BadRequestException(
        'Project has not been registered on-chain yet',
      );
    }

    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      select: {
        id: true,
        order: true,
        status: true,
        onChainMilestoneAddress: true,
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (!milestone.onChainMilestoneAddress) {
      throw new BadRequestException(
        'Milestone has not been submitted on-chain yet',
      );
    }

    const transaction = await this.blockchain.finalizeMilestoneVoteOnChain(
      project.onChainProjectAddress,
      milestone.order,
      user.walletAddress,
    );

    const pendingTransaction = await this.createPendingTransaction({
      projectId,
      milestoneId,
      userId: user.id,
      wallet: user.walletAddress,
      operation: OnChainOperation.FINALIZE_VOTE,
      expectedProjectAddress: project.onChainProjectAddress,
      expectedMilestoneAddress: milestone.onChainMilestoneAddress,
    });

    return {
      requestId: pendingTransaction.id,
      transaction: transaction.toString('base64'),
    };
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
      select: {
        id: true,
        order: true,
        status: true,
        onChainMilestoneAddress: true,
      },
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

    const transaction = await this.blockchain.releaseMilestoneOnChain(
      user.walletAddress,
      project.onChainProjectAddress,
      milestone.order,
    );

    const pendingTransaction = await this.createPendingTransaction({
      projectId,
      milestoneId,
      userId: user.id,
      wallet: user.walletAddress,
      operation: OnChainOperation.RELEASE_FUNDS,
      expectedProjectAddress: project.onChainProjectAddress,
      expectedEscrowVaultAddress: this.blockchain.getEscrowVaultPda(
        project.onChainProjectAddress,
      ),
      expectedMilestoneAddress: milestone.onChainMilestoneAddress,
    });

    return {
      requestId: pendingTransaction.id,
      transaction: transaction.toString('base64'),
    };
  }

  private async createPendingTransaction(input: CreatePendingTransactionInput) {
    const id = randomUUID();
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO "OnChainTransaction" (
        "id",
        "projectId",
        "milestoneId",
        "userId",
        "wallet",
        "operation",
        "expectedProjectAddress",
        "expectedEscrowVaultAddress",
        "expectedMilestoneAddress",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${input.projectId},
        ${input.milestoneId},
        ${input.userId},
        ${input.wallet},
        ${input.operation}::"OnChainOperation",
        ${input.expectedProjectAddress},
        ${input.expectedEscrowVaultAddress ?? null},
        ${input.expectedMilestoneAddress ?? null},
        ${new Date()}
      )
      RETURNING "id"
    `;

    return rows[0];
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
