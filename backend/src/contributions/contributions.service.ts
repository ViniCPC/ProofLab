import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '../users/users.service';
import type { CreateContributionDto } from './dto/create-contribution.dto';
import type { ListContributionsQueryDto } from './dto/list-contributions-query.dto';

type ContributionWithFunder = Prisma.ContributionGetPayload<{
  include: {
    funder: {
      select: {
        id: true;
        name: true;
        walletAddress: true;
        role: true;
        reputation: true;
        createdAt: true;
      };
    };
  };
}>;

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  async contribute(
    projectId: string,
    dto: CreateContributionDto,
    user: PublicUser,
  ) {
    const project = await this.findProjectOrThrow(projectId);
    const amount = new Prisma.Decimal(dto.amount);

    const contribution = await this.prisma.contribution.upsert({
      where: {
        wallet_projectId: {
          wallet: user.walletAddress,
          projectId,
        },
      },
      update: {
        amount: {
          increment: amount,
        },
      },
      create: {
        amount,
        wallet: user.walletAddress,
        projectId,
      },
      include: this.contributionInclude(),
    });

    return {
      contribution: this.serializeContribution(contribution),
      funding: await this.getFunding(project.id, project.totalAmount, {
        page: 1,
        limit: 10,
      }),
    };
  }

  async findByProject(projectId: string, query: ListContributionsQueryDto) {
    const project = await this.findProjectOrThrow(projectId);

    return this.getFunding(project.id, project.totalAmount, query);
  }

  private async findProjectOrThrow(projectId: string) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        totalAmount: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Research project not found');
    }

    return project;
  }

  private async getFunding(
    projectId: string,
    totalAmount: Prisma.Decimal,
    query: ListContributionsQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [aggregate, totalInvestors, contributions] =
      await this.prisma.$transaction([
        this.prisma.contribution.aggregate({
          where: { projectId },
          _sum: { amount: true },
        }),
        this.prisma.contribution.count({
          where: { projectId },
        }),
        this.prisma.contribution.findMany({
          where: { projectId },
          skip,
          take: limit,
          orderBy: { createdAt: 'asc' },
          include: this.contributionInclude(),
        }),
      ]);

    const totalRaised = aggregate._sum.amount ?? new Prisma.Decimal(0);
    const fundingPercentage = totalAmount.equals(0)
      ? new Prisma.Decimal(0)
      : totalRaised.div(totalAmount).mul(100);

    return {
      projectId,
      totalRaised: totalRaised.toFixed(6),
      totalAmount: totalAmount.toFixed(6),
      fundingPercentage: Number(fundingPercentage.toFixed(2)),
      investors: contributions.map((contribution) =>
        this.serializeContribution(contribution),
      ),
      meta: {
        page,
        limit,
        total: totalInvestors,
        totalPages: Math.ceil(totalInvestors / limit),
      },
    };
  }

  private contributionInclude() {
    return {
      funder: {
        select: {
          id: true,
          name: true,
          walletAddress: true,
          role: true,
          reputation: true,
          createdAt: true,
        },
      },
    } satisfies Prisma.ContributionInclude;
  }

  private serializeContribution(contribution: ContributionWithFunder) {
    return {
      id: contribution.id,
      amount: contribution.amount.toFixed(6),
      createdAt: contribution.createdAt,
      wallet: contribution.wallet,
      projectId: contribution.projectId,
      funder: contribution.funder,
    };
  }
}
