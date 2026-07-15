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
import {
  BlockchainService,
  TransactionVerificationResult,
} from '../blockchain/blockchain.service';
import { toUsdcBaseUnits } from '../blockchain/blockchain.utils';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '../users/users.service';
import type { ConfirmTransactionDto } from './dto/confirm-transaction.dto';
import type { CreateResearchDto } from './dto/create-research.dto';
import type { FundOnChainDto } from './dto/fund-on-chain.dto';
import type { ListResearchQueryDto } from './dto/list-research-query.dto';

const creatorSelect = {
  id: true,
  name: true,
  walletAddress: true,
} satisfies Prisma.UserSelect;

const OnChainOperation = {
  CREATE_PROJECT: 'CREATE_PROJECT',
  FUND_PROJECT: 'FUND_PROJECT',
  CREATE_MILESTONE: 'CREATE_MILESTONE',
  SUBMIT_MILESTONE: 'SUBMIT_MILESTONE',
  VOTE_MILESTONE: 'VOTE_MILESTONE',
  FINALIZE_VOTE: 'FINALIZE_VOTE',
  RELEASE_FUNDS: 'RELEASE_FUNDS',
  CANCEL_PROJECT: 'CANCEL_PROJECT',
  CLAIM_REFUND: 'CLAIM_REFUND',
} as const;

type OnChainOperation =
  (typeof OnChainOperation)[keyof typeof OnChainOperation];

const OnChainTransactionStatus = {
  PENDING_SIGNATURE: 'PENDING_SIGNATURE',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
} as const;

type OnChainTransactionStatus =
  (typeof OnChainTransactionStatus)[keyof typeof OnChainTransactionStatus];

interface OnChainTransaction {
  id: string;
  projectId: string;
  userId: string;
  wallet: string;
  operation: OnChainOperation;
  status: OnChainTransactionStatus;
  signature: string | null;
  amount: Prisma.Decimal | null;
  nonce: bigint | null;
  expectedProjectAddress: string | null;
  expectedEscrowVaultAddress: string | null;
  expectedContributionAddress: string | null;
  expectedMilestoneAddress: string | null;
  expectedVoteAddress: string | null;
  metadata: Prisma.JsonValue | null;
  milestoneId: string | null;
  slot: bigint | null;
  confirmationStatus: string | null;
  logs: Prisma.JsonValue | null;
  errorMessage: string | null;
  confirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreatePendingTransactionInput {
  projectId: string;
  userId: string;
  wallet: string;
  operation: OnChainOperation;
  amount?: Prisma.Decimal | null;
  nonce?: bigint | null;
  expectedProjectAddress?: string | null;
  expectedEscrowVaultAddress?: string | null;
  expectedContributionAddress?: string | null;
  expectedMilestoneAddress?: string | null;
  expectedVoteAddress?: string | null;
  metadata?: Prisma.InputJsonValue | null;
  milestoneId?: string | null;
}

@Injectable()
export class ResearchService {
  private readonly logger = new Logger(ResearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly blockchain: BlockchainService,
  ) {}

  async create(dto: CreateResearchDto, creator: PublicUser) {
    const analysis = await this.runResearchAnalysis(
      {
        title: dto.title,
        description: dto.description,
        totalAmount: dto.totalAmount,
        milestones: dto.milestones,
      },
      creator.walletAddress,
    );

    return this.prisma.researchProject.create({
      data: {
        title: dto.title,
        description: dto.description,
        totalAmount: dto.totalAmount,
        ...analysis,
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

  async reanalyze(projectId: string, user: PublicUser) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        description: true,
        totalAmount: true,
        creatorId: true,
        milestones: {
          orderBy: { order: 'asc' },
          select: { title: true, description: true, amount: true, order: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Research project not found');
    }

    if (project.creatorId !== user.id) {
      throw new ForbiddenException(
        'Only the project creator can request a new AI analysis',
      );
    }

    const analysis = await this.runResearchAnalysis(
      {
        title: project.title,
        description: project.description,
        totalAmount: project.totalAmount,
        milestones: project.milestones.map((milestone) => ({
          title: milestone.title,
          description: milestone.description,
          amount: milestone.amount.toString(),
          order: milestone.order,
        })),
      },
      user.walletAddress,
    );

    const updated = await this.prisma.researchProject.update({
      where: { id: projectId },
      data:
        analysis.aiStatus === 'FAILED' ? { aiStatus: 'FAILED' } : analysis,
      include: {
        creator: { select: creatorSelect },
        milestones: { orderBy: { order: 'asc' } },
      },
    });

    return this.serializeResearch(updated);
  }

  private async runResearchAnalysis(
    input: {
      title: string;
      description: string;
      totalAmount: Prisma.Decimal | string;
      milestones?: {
        title: string;
        description: string;
        amount: string;
        order: number;
      }[];
    },
    actor: string,
  ) {
    try {
      const analysis = await this.aiService.analyzeResearch(
        {
          title: input.title,
          description: input.description,
          totalAmount: input.totalAmount.toString(),
          milestones: input.milestones,
        },
        actor,
      );

      return {
        aiStatus: 'COMPLETED' as const,
        aiSummary: analysis.summary,
        aiRecommendation: analysis.recommendation,
        innovationScore: analysis.innovationScore,
        feasibilityScore: analysis.feasibilityScore,
        riskLevel: analysis.riskLevel,
        complexityLevel: analysis.complexityLevel,
      };
    } catch (error) {
      this.logger.warn(
        `AI research analysis failed, saving project without it: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return {
        aiStatus: 'FAILED' as const,
        aiSummary: null,
        aiRecommendation: null,
        innovationScore: null,
        feasibilityScore: null,
        riskLevel: null,
        complexityLevel: null,
      };
    }
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
      toUsdcBaseUnits(project.totalAmount),
    );

    const pendingTransaction = await this.createPendingTransaction({
      projectId,
      userId: user.id,
      wallet: user.walletAddress,
      operation: OnChainOperation.CREATE_PROJECT,
      nonce,
      expectedProjectAddress: onChainProjectAddress,
      expectedEscrowVaultAddress: escrowVaultAddress,
    });

    return {
      requestId: pendingTransaction.id,
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
    const amount = new Prisma.Decimal(dto.amount);

    const transaction = await this.blockchain.fundProjectOnChain(
      user.walletAddress,
      project.onChainProjectAddress,
      toUsdcBaseUnits(amount),
    );

    const pendingTransaction = await this.createPendingTransaction({
      projectId,
      userId: user.id,
      wallet: user.walletAddress,
      operation: OnChainOperation.FUND_PROJECT,
      amount,
      expectedProjectAddress: project.onChainProjectAddress,
      expectedContributionAddress: contributionPda,
    });

    return {
      requestId: pendingTransaction.id,
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

    const pendingTransaction = await this.createPendingTransaction({
      projectId,
      userId: user.id,
      wallet: user.walletAddress,
      operation: OnChainOperation.CLAIM_REFUND,
      expectedProjectAddress: project.onChainProjectAddress,
      expectedContributionAddress: this.blockchain.getContributionPda(
        project.onChainProjectAddress,
        user.walletAddress,
      ),
    });

    return {
      requestId: pendingTransaction.id,
      transaction: transaction.toString('base64'),
    };
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

    const pendingTransaction = await this.createPendingTransaction({
      projectId,
      userId: user.id,
      wallet: user.walletAddress,
      operation: OnChainOperation.CANCEL_PROJECT,
      expectedProjectAddress: project.onChainProjectAddress,
    });

    return {
      requestId: pendingTransaction.id,
      transaction: transaction.toString('base64'),
    };
  }

  async confirmTransaction(
    projectId: string,
    dto: ConfirmTransactionDto,
    user: PublicUser,
  ) {
    const pending = await this.findPendingTransaction(dto.requestId);

    if (!pending) {
      throw new NotFoundException('Pending transaction not found');
    }

    if (pending.projectId !== projectId) {
      throw new BadRequestException(
        'Transaction does not belong to this project',
      );
    }

    if (pending.userId !== user.id || pending.wallet !== user.walletAddress) {
      throw new ForbiddenException(
        'Transaction does not belong to this wallet session',
      );
    }

    if (
      pending.status === OnChainTransactionStatus.CONFIRMED &&
      pending.signature === dto.signature
    ) {
      return {
        status: 'CONFIRMED',
        signature: pending.signature,
      };
    }

    if (pending.status === OnChainTransactionStatus.CONFIRMED) {
      throw new ConflictException(
        'Pending transaction is already confirmed with another signature',
      );
    }

    if (pending.signature && pending.signature !== dto.signature) {
      throw new BadRequestException(
        'Pending transaction already has a different signature',
      );
    }

    const existingSignature = await this.findTransactionBySignature(
      dto.signature,
    );

    if (existingSignature && existingSignature.id !== pending.id) {
      throw new ConflictException(
        'Signature is already attached to another transaction',
      );
    }

    const verification = await this.blockchain.verifyTransaction(
      dto.signature,
      pending,
    );

    if (verification.status === 'PENDING') {
      await this.markSubmitted(pending.id, dto.signature, verification);

      return {
        status: 'PENDING',
        signature: dto.signature,
      };
    }

    if (verification.status === 'FAILED') {
      await this.markFailed(pending.id, dto.signature, verification);

      throw new BadRequestException('On-chain transaction failed');
    }

    return this.applyConfirmedTransaction(pending, verification);
  }

  private async applyConfirmedTransaction(
    pending: OnChainTransaction,
    verification: TransactionVerificationResult,
  ) {
    switch (pending.operation) {
      case OnChainOperation.CREATE_PROJECT:
        return this.confirmProjectCreation(pending, verification);
      case OnChainOperation.FUND_PROJECT:
        return this.confirmProjectFunding(pending, verification);
      case OnChainOperation.CREATE_MILESTONE:
        return this.confirmMilestoneCreation(pending, verification);
      case OnChainOperation.SUBMIT_MILESTONE:
        return this.confirmMilestoneSubmission(pending, verification);
      case OnChainOperation.VOTE_MILESTONE:
        return this.confirmMilestoneVote(pending, verification);
      case OnChainOperation.FINALIZE_VOTE:
        return this.confirmVoteFinalization(pending, verification);
      case OnChainOperation.RELEASE_FUNDS:
        return this.confirmFundsRelease(pending, verification);
      case OnChainOperation.CANCEL_PROJECT:
        return this.confirmProjectCancellation(pending, verification);
      case OnChainOperation.CLAIM_REFUND:
        return this.confirmRefund(pending, verification);
      default:
        throw new BadRequestException('Unsupported on-chain operation');
    }
  }

  private async confirmProjectCreation(
    pending: OnChainTransaction,
    verification: TransactionVerificationResult,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.researchProject.update({
        where: { id: pending.projectId },
        data: {
          onChainProjectNonce: pending.nonce,
          onChainProjectAddress: pending.expectedProjectAddress,
          escrowVaultAddress: pending.expectedEscrowVaultAddress,
          onChainStatus: 'Funding',
        },
      });

      await this.markConfirmed(tx, pending, verification);

      return {
        status: 'CONFIRMED',
        operation: pending.operation,
        signature: verification.signature,
        onChainProjectAddress: pending.expectedProjectAddress,
        escrowVaultAddress: pending.expectedEscrowVaultAddress,
      };
    });
  }

  private async confirmProjectFunding(
    pending: OnChainTransaction,
    verification: TransactionVerificationResult,
  ) {
    if (!pending.amount) {
      throw new BadRequestException('Funding transaction amount is missing');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.contribution.upsert({
        where: {
          wallet_projectId: {
            wallet: pending.wallet,
            projectId: pending.projectId,
          },
        },
        create: {
          amount: pending.amount!,
          wallet: pending.wallet,
          projectId: pending.projectId,
          transactionHash: verification.signature,
          onChainContributionAddress: pending.expectedContributionAddress,
        },
        update: {
          amount: {
            increment: pending.amount!,
          },
          transactionHash: verification.signature,
          onChainContributionAddress: pending.expectedContributionAddress,
        },
      });

      await this.markConfirmed(tx, pending, verification);

      return {
        status: 'CONFIRMED',
        operation: pending.operation,
        signature: verification.signature,
        onChainContributionAddress: pending.expectedContributionAddress,
      };
    });
  }

  private async confirmMilestoneCreation(
    pending: OnChainTransaction,
    verification: TransactionVerificationResult,
  ) {
    if (!pending.milestoneId || !pending.expectedMilestoneAddress) {
      throw new BadRequestException(
        'Milestone creation transaction data is missing',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.milestone.update({
        where: { id: pending.milestoneId! },
        data: {
          onChainMilestoneAddress: pending.expectedMilestoneAddress,
        },
      });

      await this.markConfirmed(tx, pending, verification);

      return {
        status: 'CONFIRMED',
        operation: pending.operation,
        signature: verification.signature,
        onChainMilestoneAddress: pending.expectedMilestoneAddress,
      };
    });
  }

  private async confirmMilestoneSubmission(
    pending: OnChainTransaction,
    verification: TransactionVerificationResult,
  ) {
    if (!pending.milestoneId) {
      throw new BadRequestException(
        'Milestone submission transaction data is missing',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.milestone.update({
        where: { id: pending.milestoneId! },
        data: {
          status: 'PENDING_REVIEW',
          onChainMilestoneAddress:
            pending.expectedMilestoneAddress ?? undefined,
        },
      });

      await this.markConfirmed(tx, pending, verification);

      return {
        status: 'CONFIRMED',
        operation: pending.operation,
        signature: verification.signature,
        onChainMilestoneAddress: pending.expectedMilestoneAddress,
      };
    });
  }

  private async confirmMilestoneVote(
    pending: OnChainTransaction,
    verification: TransactionVerificationResult,
  ) {
    if (!pending.milestoneId) {
      throw new BadRequestException('Vote transaction milestone is missing');
    }

    const approve = this.getPendingVoteApproval(pending);

    return this.prisma.$transaction(async (tx) => {
      await tx.vote.upsert({
        where: {
          voterWallet_milestoneId: {
            voterWallet: pending.wallet,
            milestoneId: pending.milestoneId!,
          },
        },
        create: {
          approve,
          voterWallet: pending.wallet,
          milestoneId: pending.milestoneId!,
        },
        update: { approve },
      });

      await this.markConfirmed(tx, pending, verification);

      return {
        status: 'CONFIRMED',
        operation: pending.operation,
        signature: verification.signature,
        onChainVoteAddress: pending.expectedVoteAddress,
      };
    });
  }

  private async confirmVoteFinalization(
    pending: OnChainTransaction,
    verification: TransactionVerificationResult,
  ) {
    if (!pending.milestoneId || !pending.expectedMilestoneAddress) {
      throw new BadRequestException(
        'Vote finalization transaction data is missing',
      );
    }

    const onChainStatus = await this.blockchain.getMilestoneStatus(
      pending.expectedMilestoneAddress,
    );
    const milestoneStatus =
      onChainStatus === 'APPROVED'
        ? 'APPROVED'
        : onChainStatus === 'REJECTED'
          ? 'REJECTED'
          : onChainStatus === 'PENDING_REVIEW'
            ? 'PENDING_REVIEW'
            : undefined;

    if (!milestoneStatus) {
      throw new BadRequestException(
        `Unexpected finalized milestone status: ${onChainStatus}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.milestone.update({
        where: { id: pending.milestoneId! },
        data: { status: milestoneStatus },
      });

      if (milestoneStatus === 'REJECTED') {
        await tx.researchProject.update({
          where: { id: pending.projectId },
          data: {
            status: 'CANCELLED',
            onChainStatus: 'Cancelled',
          },
        });
      }

      await this.markConfirmed(tx, pending, verification);

      return {
        status: 'CONFIRMED',
        operation: pending.operation,
        signature: verification.signature,
        onChainMilestoneAddress: pending.expectedMilestoneAddress,
      };
    });
  }

  private async confirmFundsRelease(
    pending: OnChainTransaction,
    verification: TransactionVerificationResult,
  ) {
    if (!pending.milestoneId) {
      throw new BadRequestException('Release transaction milestone is missing');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.milestone.update({
        where: { id: pending.milestoneId! },
        data: {
          releaseTransactionHash: verification.signature,
        },
      });

      await this.markConfirmed(tx, pending, verification);

      return {
        status: 'CONFIRMED',
        operation: pending.operation,
        signature: verification.signature,
      };
    });
  }

  private async confirmProjectCancellation(
    pending: OnChainTransaction,
    verification: TransactionVerificationResult,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.researchProject.update({
        where: { id: pending.projectId },
        data: {
          status: 'CANCELLED',
          onChainStatus: 'Cancelled',
        },
      });

      await this.markConfirmed(tx, pending, verification);

      return {
        status: 'CONFIRMED',
        operation: pending.operation,
        signature: verification.signature,
      };
    });
  }

  private async confirmRefund(
    pending: OnChainTransaction,
    verification: TransactionVerificationResult,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await this.markConfirmed(tx, pending, verification);

      return {
        status: 'CONFIRMED',
        operation: pending.operation,
        signature: verification.signature,
      };
    });
  }

  private getPendingVoteApproval(pending: OnChainTransaction): boolean {
    const metadata = pending.metadata;

    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      throw new BadRequestException('Vote transaction metadata is missing');
    }

    const approve = (metadata as Record<string, unknown>).approve;

    if (typeof approve !== 'boolean') {
      throw new BadRequestException('Vote transaction approval is missing');
    }

    return approve;
  }

  private async markConfirmed(
    tx: Prisma.TransactionClient,
    pending: OnChainTransaction,
    verification: TransactionVerificationResult,
  ) {
    const logs = JSON.stringify(verification.logs ?? []);
    await tx.$executeRaw`
      UPDATE "OnChainTransaction"
      SET
        "signature" = ${verification.signature},
        "status" = ${OnChainTransactionStatus.CONFIRMED}::"OnChainTransactionStatus",
        "slot" = ${verification.slot ?? null},
        "confirmationStatus" = ${verification.confirmationStatus ?? null},
        "logs" = ${logs}::jsonb,
        "confirmedAt" = ${new Date()},
        "updatedAt" = ${new Date()}
      WHERE "id" = ${pending.id}
    `;
  }

  private async createPendingTransaction(
    input: CreatePendingTransactionInput,
  ): Promise<OnChainTransaction> {
    const id = randomUUID();
    const rows = await this.prisma.$queryRaw<OnChainTransaction[]>`
      INSERT INTO "OnChainTransaction" (
        "id",
        "projectId",
        "userId",
        "wallet",
        "operation",
        "amount",
        "nonce",
        "expectedProjectAddress",
        "expectedEscrowVaultAddress",
        "expectedContributionAddress",
        "expectedMilestoneAddress",
        "expectedVoteAddress",
        "metadata",
        "milestoneId",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${input.projectId},
        ${input.userId},
        ${input.wallet},
        ${input.operation}::"OnChainOperation",
        ${input.amount ?? null},
        ${input.nonce ?? null},
        ${input.expectedProjectAddress ?? null},
        ${input.expectedEscrowVaultAddress ?? null},
        ${input.expectedContributionAddress ?? null},
        ${input.expectedMilestoneAddress ?? null},
        ${input.expectedVoteAddress ?? null},
        ${input.metadata ? JSON.stringify(input.metadata) : null}::jsonb,
        ${input.milestoneId ?? null},
        ${new Date()}
      )
      RETURNING *
    `;

    return rows[0];
  }

  private async findPendingTransaction(
    id: string,
  ): Promise<OnChainTransaction | null> {
    const rows = await this.prisma.$queryRaw<OnChainTransaction[]>`
      SELECT *
      FROM "OnChainTransaction"
      WHERE "id" = ${id}
      LIMIT 1
    `;

    return rows[0] ?? null;
  }

  private async findTransactionBySignature(
    signature: string,
  ): Promise<OnChainTransaction | null> {
    const rows = await this.prisma.$queryRaw<OnChainTransaction[]>`
      SELECT *
      FROM "OnChainTransaction"
      WHERE "signature" = ${signature}
      LIMIT 1
    `;

    return rows[0] ?? null;
  }

  private async markSubmitted(
    id: string,
    signature: string,
    verification: TransactionVerificationResult,
  ) {
    await this.prisma.$executeRaw`
      UPDATE "OnChainTransaction"
      SET
        "signature" = ${signature},
        "status" = ${OnChainTransactionStatus.SUBMITTED}::"OnChainTransactionStatus",
        "slot" = ${verification.slot ?? null},
        "confirmationStatus" = ${verification.confirmationStatus ?? null},
        "updatedAt" = ${new Date()}
      WHERE "id" = ${id}
    `;
  }

  private async markFailed(
    id: string,
    signature: string,
    verification: TransactionVerificationResult,
  ) {
    const logs = JSON.stringify(verification.logs ?? []);
    await this.prisma.$executeRaw`
      UPDATE "OnChainTransaction"
      SET
        "signature" = ${signature},
        "status" = ${OnChainTransactionStatus.FAILED}::"OnChainTransactionStatus",
        "slot" = ${verification.slot ?? null},
        "confirmationStatus" = ${verification.confirmationStatus ?? null},
        "logs" = ${logs}::jsonb,
        "errorMessage" = ${JSON.stringify(verification.error ?? null)},
        "updatedAt" = ${new Date()}
      WHERE "id" = ${id}
    `;
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
