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
import type { CreateResearchDto } from './dto/create-research.dto';
import type { FundOnChainDto } from './dto/fund-on-chain.dto';
import type { ListResearchQueryDto } from './dto/list-research-query.dto';

const creatorSelect = {
  id: true,
  name: true,
  walletAddress: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class ResearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly blockchain: BlockchainService,
  ) {}

  async create(dto: CreateResearchDto, creator: PublicUser) {
    const analysis = await this.aiService.analyzeResearch({
      title: dto.title,
      description: dto.description,
      totalAmount: dto.totalAmount,
      milestones: dto.milestones,
    });

    return this.prisma.researchProject.create({
      data: {
        title: dto.title,
        description: dto.description,
        totalAmount: dto.totalAmount,
        aiSummary: analysis.summary,
        innovationScore: analysis.innovationScore,
        feasibilityScore: analysis.feasibilityScore,
        riskLevel: analysis.riskLevel,
        complexityLevel: analysis.complexityLevel,
        creatorId: creator.id,
        milestones: dto.milestones?.length
          ? {
              create: dto.milestones.map((milestone) => ({
                title: milestone.title,
                description: milestone.description,
                amount: milestone.amount,
                order: milestone.order,
              })),
            }
          : undefined,
      },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(query: ListResearchQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.researchProject.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: creatorSelect,
          },
        },
      }),
      this.prisma.researchProject.count(),
    ]);

    return {
      data: data.map((research) => this.serializeResearch(research)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const research = await this.prisma.researchProject.findUnique({
      where: { id },
      include: {
        creator: {
          select: creatorSelect,
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!research) {
      throw new NotFoundException('Research project not found');
    }

    return this.serializeResearch(research);
  }

  async createOnChain(projectId: string, user: PublicUser) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        totalAmount: true,
        creatorId: true,
        onChainProjectAddress: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Research project not found');
    }

    if (project.creatorId !== user.id) {
      throw new ForbiddenException(
        'Only the project creator can register it on-chain',
      );
    }

    if (project.onChainProjectAddress) {
      throw new ConflictException('Project is already registered on-chain');
    }

    const nonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    const onChainProjectAddress = this.blockchain.getProjectPda(
      user.walletAddress,
      nonce,
    );
    const escrowVaultAddress = this.blockchain.getEscrowVaultPda(
      onChainProjectAddress,
    );

    const transaction = await this.blockchain.createProjectOnChain(
      user.walletAddress,
      nonce,
      project.title,
      Number(project.totalAmount),
    );

    await this.prisma.researchProject.update({
      where: { id: projectId },
      data: {
        onChainProjectNonce: nonce,
        onChainProjectAddress,
        escrowVaultAddress,
        onChainStatus: 'Funding',
      },
    });

    return {
      transaction: transaction.toString('base64'),
      onChainProjectAddress,
      escrowVaultAddress,
    };
  }

  async fundOnChain(projectId: string, dto: FundOnChainDto, user: PublicUser) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        onChainProjectAddress: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Research project not found');
    }

    if (!project.onChainProjectAddress) {
      throw new BadRequestException(
        'Project has not been registered on-chain yet',
      );
    }

    const contributionPda = this.blockchain.getContributionPda(
      project.onChainProjectAddress,
      user.walletAddress,
    );

    const transaction = await this.blockchain.fundProjectOnChain(
      user.walletAddress,
      project.onChainProjectAddress,
      dto.amount,
    );

    await this.prisma.contribution.upsert({
      where: {
        wallet_projectId: {
          wallet: user.walletAddress,
          projectId,
        },
      },
      update: { onChainContributionAddress: contributionPda },
      create: {
        amount: dto.amount,
        wallet: user.walletAddress,
        projectId,
        onChainContributionAddress: contributionPda,
      },
    });

    return {
      transaction: transaction.toString('base64'),
      onChainContributionAddress: contributionPda,
    };
  }

  async claimRefund(projectId: string, user: PublicUser) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        onChainProjectAddress: true,
        onChainStatus: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Research project not found');
    }

    if (!project.onChainProjectAddress) {
      throw new BadRequestException(
        'Project has not been registered on-chain yet',
      );
    }

    if (project.onChainStatus !== 'Cancelled') {
      throw new BadRequestException(
        'Refunds are only available for cancelled projects',
      );
    }

    const transaction = await this.blockchain.claimRefundOnChain(
      user.walletAddress,
      project.onChainProjectAddress,
    );

    return { transaction: transaction.toString('base64') };
  }

  async cancelOnChain(projectId: string, user: PublicUser) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        creatorId: true,
        status: true,
        onChainProjectAddress: true,
        onChainStatus: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Research project not found');
    }

    if (project.creatorId !== user.id) {
      throw new ForbiddenException(
        'Only the project creator can cancel the project on-chain',
      );
    }

    if (!project.onChainProjectAddress) {
      throw new BadRequestException(
        'Project has not been registered on-chain yet',
      );
    }

    if (
      project.status === 'COMPLETED' ||
      project.onChainStatus === 'Completed'
    ) {
      throw new BadRequestException('Completed projects cannot be cancelled');
    }

    if (
      project.status === 'CANCELLED' ||
      project.onChainStatus === 'Cancelled'
    ) {
      throw new BadRequestException('Project is already cancelled');
    }

    const transaction = await this.blockchain.cancelProjectOnChain(
      user.walletAddress,
      project.onChainProjectAddress,
    );

    await this.prisma.researchProject.update({
      where: { id: projectId },
      data: {
        status: 'CANCELLED',
        onChainStatus: 'Cancelled',
      },
    });

    return { transaction: transaction.toString('base64') };
  }

  private serializeResearch<T extends { onChainProjectNonce: bigint | null }>(
    research: T,
  ): Omit<T, 'onChainProjectNonce'> {
    const safeResearch = { ...research } as Omit<T, 'onChainProjectNonce'> & {
      onChainProjectNonce?: bigint | null;
    };

    delete safeResearch.onChainProjectNonce;

    return safeResearch;
  }
}
