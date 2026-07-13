import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '../users/users.service';
import type { CreateVoteDto } from './dto/create-vote.dto';
import type { VoteOnChainDto } from './dto/vote-on-chain.dto';

const OnChainOperation = {
  VOTE_MILESTONE: 'VOTE_MILESTONE',
  FINALIZE_VOTE: 'FINALIZE_VOTE',
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
  expectedContributionAddress?: string | null;
  expectedMilestoneAddress?: string | null;
  expectedVoteAddress?: string | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class VotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchain: BlockchainService,
  ) {}

  async vote(
    projectId: string,
    milestoneId: string,
    dto: CreateVoteDto,
    user: PublicUser,
  ) {
    const milestone = await this.findMilestoneOrThrow(projectId, milestoneId);

    if (
      milestone.status !== 'SUBMITTED' &&
      milestone.status !== 'PENDING_REVIEW'
    ) {
      throw new ForbiddenException(
        'Can only vote on milestones pending review',
      );
    }

    if (milestone.project.creatorId === user.id) {
      throw new ForbiddenException(
        'Project creator cannot vote on their own milestones',
      );
    }

    return this.prisma.vote.upsert({
      where: {
        voterWallet_milestoneId: {
          voterWallet: user.walletAddress,
          milestoneId,
        },
      },
      update: { approve: dto.approve },
      create: {
        approve: dto.approve,
        voterWallet: user.walletAddress,
        milestoneId,
      },
    });
  }

  async findByMilestone(projectId: string, milestoneId: string) {
    await this.findMilestoneOrThrow(projectId, milestoneId);

    const votes = await this.prisma.vote.findMany({
      where: { milestoneId },
      orderBy: { createdAt: 'desc' },
    });

    const approved = votes.filter((v) => v.approve).length;
    const rejected = votes.filter((v) => !v.approve).length;

    return {
      votes,
      summary: { total: votes.length, approved, rejected },
    };
  }

  async voteOnChain(
    projectId: string,
    milestoneId: string,
    dto: VoteOnChainDto,
    user: PublicUser,
  ) {
    const milestone = await this.findMilestoneOrThrow(projectId, milestoneId);

    if (milestone.project.creatorId === user.id) {
      throw new ForbiddenException(
        'Project creator cannot vote on their own milestones',
      );
    }

    if (
      milestone.status !== 'SUBMITTED' &&
      milestone.status !== 'PENDING_REVIEW'
    ) {
      throw new BadRequestException(
        'Can only vote on milestones pending review',
      );
    }

    if (!milestone.project.onChainProjectAddress) {
      throw new BadRequestException(
        'Project has not been registered on-chain yet',
      );
    }

    if (!milestone.onChainMilestoneAddress) {
      throw new BadRequestException(
        'Milestone has not been submitted on-chain yet',
      );
    }

    const contributionAddress = this.blockchain.getContributionPda(
      milestone.project.onChainProjectAddress,
      user.walletAddress,
    );
    const voteAddress = this.blockchain.getVotePda(
      milestone.onChainMilestoneAddress,
      user.walletAddress,
    );
    const transaction = await this.blockchain.voteMilestoneOnChain(
      user.walletAddress,
      milestone.project.onChainProjectAddress,
      milestone.order,
      dto.approve,
    );

    const pendingTransaction = await this.createPendingTransaction({
      projectId,
      milestoneId,
      userId: user.id,
      wallet: user.walletAddress,
      operation: OnChainOperation.VOTE_MILESTONE,
      expectedProjectAddress: milestone.project.onChainProjectAddress,
      expectedContributionAddress: contributionAddress,
      expectedMilestoneAddress: milestone.onChainMilestoneAddress,
      expectedVoteAddress: voteAddress,
      metadata: { approve: dto.approve },
    });

    return {
      requestId: pendingTransaction.id,
      transaction: transaction.toString('base64'),
      onChainVoteAddress: voteAddress,
    };
  }

  async finalizeVoteOnChain(
    projectId: string,
    milestoneId: string,
    user: PublicUser,
  ) {
    const milestone = await this.findMilestoneOrThrow(projectId, milestoneId);

    if (
      milestone.status !== 'SUBMITTED' &&
      milestone.status !== 'PENDING_REVIEW'
    ) {
      throw new BadRequestException(
        'Can only finalize milestones pending review',
      );
    }

    if (!milestone.project.onChainProjectAddress) {
      throw new BadRequestException(
        'Project has not been registered on-chain yet',
      );
    }

    if (!milestone.onChainMilestoneAddress) {
      throw new BadRequestException(
        'Milestone has not been created on-chain yet',
      );
    }

    const transaction = await this.blockchain.finalizeMilestoneVoteOnChain(
      milestone.project.onChainProjectAddress,
      milestone.order,
      user.walletAddress,
    );

    const pendingTransaction = await this.createPendingTransaction({
      projectId,
      milestoneId,
      userId: user.id,
      wallet: user.walletAddress,
      operation: OnChainOperation.FINALIZE_VOTE,
      expectedProjectAddress: milestone.project.onChainProjectAddress,
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
        "expectedContributionAddress",
        "expectedMilestoneAddress",
        "expectedVoteAddress",
        "metadata",
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
        ${input.expectedContributionAddress ?? null},
        ${input.expectedMilestoneAddress ?? null},
        ${input.expectedVoteAddress ?? null},
        ${input.metadata ? JSON.stringify(input.metadata) : null}::jsonb,
        ${new Date()}
      )
      RETURNING "id"
    `;

    return rows[0];
  }

  private async findMilestoneOrThrow(projectId: string, milestoneId: string) {
    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      include: {
        project: {
          select: {
            creatorId: true,
            onChainProjectAddress: true,
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    return milestone;
  }
}
