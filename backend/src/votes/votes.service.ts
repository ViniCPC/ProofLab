import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '../users/users.service';
import type { CreateVoteDto } from './dto/create-vote.dto';
import type { VoteOnChainDto } from './dto/vote-on-chain.dto';

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

    const transaction = await this.blockchain.voteMilestoneOnChain(
      user.walletAddress,
      milestone.project.onChainProjectAddress,
      milestone.order,
      dto.approve,
    );

    return { transaction: transaction.toString('base64') };
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
