import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '../users/users.service';
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
  private readonly logger = new Logger(VotesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchain: BlockchainService,
  ) {}

  async findByMilestone(projectId: string, milestoneId: string) {
    const milestone = await this.findMilestoneOrThrow(projectId, milestoneId);

    const votes = await this.prisma.vote.findMany({
      where: { milestoneId },
      orderBy: { createdAt: 'desc' },
    });

    // The contract weighs each vote by the voter's contribution. Funding is
    // closed once the project is active, so the stored contribution (synced
    // from chain) is exactly the weight the contract used.
    const contributions = await this.prisma.contribution.findMany({
      where: {
        projectId,
        wallet: { in: votes.map((vote) => vote.voterWallet) },
      },
      select: { wallet: true, amount: true },
    });
    const weightByWallet = new Map(
      contributions.map((contribution) => [
        contribution.wallet,
        contribution.amount,
      ]),
    );

    let approvedWeight = new Prisma.Decimal(0);
    let rejectedWeight = new Prisma.Decimal(0);

    for (const vote of votes) {
      const weight = weightByWallet.get(vote.voterWallet) ?? 0;

      if (vote.approve) {
        approvedWeight = approvedWeight.plus(weight);
      } else {
        rejectedWeight = rejectedWeight.plus(weight);
      }
    }

    return {
      votes,
      summary: {
        total: votes.length,
        approved: votes.filter((vote) => vote.approve).length,
        rejected: votes.filter((vote) => !vote.approve).length,
        approvedWeight: approvedWeight.toFixed(6),
        rejectedWeight: rejectedWeight.toFixed(6),
        votingEndsAt: await this.getVotingEndsAt(
          milestone.onChainMilestoneAddress,
        ),
      },
    };
  }

  private async getVotingEndsAt(milestonePda: string | null) {
    if (!milestonePda) return null;

    try {
      const deadline = await this.blockchain.getMilestoneDeadline(milestonePda);

      return new Date(deadline * 1000).toISOString();
    } catch (error) {
      this.logger.warn(
        `Could not read milestone deadline: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
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

    if (milestone.status !== 'PENDING_REVIEW') {
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

    if (milestone.status !== 'PENDING_REVIEW') {
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
