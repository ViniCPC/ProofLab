import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '../users/users.service';
import type { CreateVoteDto } from './dto/create-vote.dto';

@Injectable()
export class VotesService {
  constructor(private readonly prisma: PrismaService) {}

  async vote(
    projectId: string,
    milestoneId: string,
    dto: CreateVoteDto,
    user: PublicUser,
  ) {
    const milestone = await this.findMilestoneOrThrow(projectId, milestoneId);

    if (milestone.status !== 'SUBMITTED') {
      throw new ForbiddenException('Can only vote on SUBMITTED milestones');
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

  private async findMilestoneOrThrow(projectId: string, milestoneId: string) {
    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      include: { project: { select: { creatorId: true } } },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    return milestone;
  }
}
