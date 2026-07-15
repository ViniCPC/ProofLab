import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ParsedTransactionWithMeta,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { BlockchainProvider } from './blockchain.provider';
import {
  deriveContributionPda,
  deriveEscrowTokenAccountPda,
  deriveEscrowVaultPda,
  deriveMilestonePda,
  deriveProjectPda,
  deriveVotePda,
} from './blockchain.pda';
import { BlockchainTx } from './blockchain.tx';
import { ChainAmount, toBN, toPublicKey } from './blockchain.utils';

type VerificationStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';
export type OnChainMilestoneStatus =
  | 'CREATED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RELEASED';
type ExpectedOperation =
  | 'CREATE_PROJECT'
  | 'FUND_PROJECT'
  | 'CREATE_MILESTONE'
  | 'SUBMIT_MILESTONE'
  | 'VOTE_MILESTONE'
  | 'FINALIZE_VOTE'
  | 'RELEASE_FUNDS'
  | 'CANCEL_PROJECT'
  | 'CLAIM_REFUND';

export interface ExpectedOnChainTransaction {
  operation: ExpectedOperation;
  wallet: string;
  amount?: unknown;
  expectedProjectAddress?: string | null;
  expectedEscrowVaultAddress?: string | null;
  expectedContributionAddress?: string | null;
  expectedMilestoneAddress?: string | null;
  expectedVoteAddress?: string | null;
}

export interface TransactionVerificationResult {
  status: VerificationStatus;
  signature: string;
  slot?: bigint;
  confirmationStatus?: string | null;
  logs?: string[];
  error?: unknown;
}

const operationLogLabels: Record<ExpectedOperation, string> = {
  CREATE_PROJECT: 'Instruction: CreateProject',
  FUND_PROJECT: 'Instruction: FundProject',
  CREATE_MILESTONE: 'Instruction: CreateMilestone',
  SUBMIT_MILESTONE: 'Instruction: SubmitMilestone',
  VOTE_MILESTONE: 'Instruction: VoteMilestone',
  FINALIZE_VOTE: 'Instruction: FinalizeMilestoneVote',
  RELEASE_FUNDS: 'Instruction: ReleaseFunds',
  CANCEL_PROJECT: 'Instruction: CancelProject',
  CLAIM_REFUND: 'Instruction: ClaimRefund',
};
const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

@Injectable()
export class BlockchainService {
  constructor(
    private readonly provider: BlockchainProvider,
    private readonly tx: BlockchainTx,
  ) {}

  async createProjectOnChain(
    ownerPubkey: string,
    projectId: ChainAmount,
    title: string,
    totalAmount: ChainAmount,
  ): Promise<Buffer> {
    return this.tx.wrapChainCall(async () => {
      const owner = toPublicKey(ownerPubkey);
      const project = deriveProjectPda(
        owner,
        projectId,
        this.provider.programId,
      );
      const escrowVault = deriveEscrowVaultPda(
        project,
        this.provider.programId,
      );
      const escrowTokenAccount = deriveEscrowTokenAccountPda(
        project,
        this.provider.programId,
      );

      const instruction = await this.provider.program.methods
        .createProject(toBN(projectId), title, toBN(totalAmount))
        .accountsStrict({
          project,
          escrowVault,
          usdcMint: this.tx.getUsdcMint(),
          escrowTokenAccount,
          owner,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      return this.tx.serialize(owner, [instruction]);
    });
  }

  async createMilestoneOnChain(
    ownerPubkey: string,
    projectPda: string,
    milestoneOrder: ChainAmount,
    amount: ChainAmount,
    deadline: ChainAmount,
  ): Promise<Buffer> {
    return this.tx.wrapChainCall(async () => {
      const owner = toPublicKey(ownerPubkey);
      const project = toPublicKey(projectPda);
      const milestone = deriveMilestonePda(
        project,
        milestoneOrder,
        this.provider.programId,
      );

      const instruction = await this.provider.program.methods
        .createMilestone(toBN(milestoneOrder), toBN(amount), toBN(deadline))
        .accountsStrict({
          project,
          milestone,
          owner,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      return this.tx.serialize(owner, [instruction]);
    });
  }

  async fundProjectOnChain(
    contributorPubkey: string,
    projectPda: string,
    amount: ChainAmount,
  ): Promise<Buffer> {
    return this.tx.wrapChainCall(async () => {
      const contributor = toPublicKey(contributorPubkey);
      const project = toPublicKey(projectPda);
      const projectAccount = await this.tx.fetchProject(project);

      const instruction = await this.provider.program.methods
        .fundProject(toBN(amount))
        .accountsStrict({
          project,
          escrowVault: deriveEscrowVaultPda(project, this.provider.programId),
          donorTokenAccount: this.tx.getAssociatedTokenAccount(
            projectAccount.usdcMint,
            contributor,
          ),
          escrowTokenAccount: projectAccount.escrowTokenAccount,
          contribution: deriveContributionPda(
            project,
            contributor,
            this.provider.programId,
          ),
          contributor,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      return this.tx.serialize(contributor, [instruction]);
    });
  }

  async submitMilestoneOnChain(
    ownerPubkey: string,
    projectPda: string,
    milestoneOrder: ChainAmount,
    votingDurationSeconds: ChainAmount,
  ): Promise<Buffer> {
    return this.tx.wrapChainCall(async () => {
      const owner = toPublicKey(ownerPubkey);
      const project = toPublicKey(projectPda);

      const instruction = await this.provider.program.methods
        .submitMilestone(toBN(votingDurationSeconds))
        .accountsStrict({
          project,
          milestone: deriveMilestonePda(
            project,
            milestoneOrder,
            this.provider.programId,
          ),
          owner,
        })
        .instruction();

      return this.tx.serialize(owner, [instruction]);
    });
  }

  async voteMilestoneOnChain(
    voterPubkey: string,
    projectPda: string,
    milestoneOrder: ChainAmount,
    approve: boolean,
  ): Promise<Buffer> {
    return this.tx.wrapChainCall(async () => {
      const voter = toPublicKey(voterPubkey);
      const project = toPublicKey(projectPda);
      const milestone = deriveMilestonePda(
        project,
        milestoneOrder,
        this.provider.programId,
      );

      const instruction = await this.provider.program.methods
        .voteMilestone(approve)
        .accountsStrict({
          project,
          milestone,
          contribution: deriveContributionPda(
            project,
            voter,
            this.provider.programId,
          ),
          vote: deriveVotePda(milestone, voter, this.provider.programId),
          voter,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      return this.tx.serialize(voter, [instruction]);
    });
  }

  async finalizeMilestoneVoteOnChain(
    projectPda: string,
    milestoneOrder: ChainAmount,
    feePayerPubkey: string,
  ): Promise<Buffer> {
    return this.tx.wrapChainCall(async () => {
      const feePayer = toPublicKey(feePayerPubkey);
      const project = toPublicKey(projectPda);

      const instruction = await this.provider.program.methods
        .finalizeMilestoneVote()
        .accountsStrict({
          project,
          milestone: deriveMilestonePda(
            project,
            milestoneOrder,
            this.provider.programId,
          ),
        })
        .instruction();

      return this.tx.serialize(feePayer, [instruction]);
    });
  }

  async releaseMilestoneOnChain(
    ownerPubkey: string,
    projectPda: string,
    milestoneOrder: ChainAmount,
  ): Promise<Buffer> {
    return this.tx.wrapChainCall(async () => {
      const owner = toPublicKey(ownerPubkey);
      const project = toPublicKey(projectPda);
      const projectAccount = await this.tx.fetchProject(project);
      const researcherTokenAccount = this.tx.getAssociatedTokenAccount(
        projectAccount.usdcMint,
        owner,
      );
      const setupInstructions = await this.tx.createAtaIfMissing(
        owner,
        researcherTokenAccount,
        owner,
        projectAccount.usdcMint,
      );

      const instruction = await this.provider.program.methods
        .releaseFunds()
        .accountsStrict({
          project,
          escrowVault: deriveEscrowVaultPda(project, this.provider.programId),
          milestone: deriveMilestonePda(
            project,
            milestoneOrder,
            this.provider.programId,
          ),
          escrowTokenAccount: projectAccount.escrowTokenAccount,
          researcherTokenAccount,
          owner,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction();

      return this.tx.serialize(owner, [...setupInstructions, instruction]);
    });
  }

  async cancelProjectOnChain(
    ownerPubkey: string,
    projectPda: string,
  ): Promise<Buffer> {
    return this.tx.wrapChainCall(async () => {
      const owner = toPublicKey(ownerPubkey);
      const project = toPublicKey(projectPda);

      const instruction = await this.provider.program.methods
        .cancelProject()
        .accountsStrict({
          project,
          owner,
        })
        .instruction();

      return this.tx.serialize(owner, [instruction]);
    });
  }

  async claimRefundOnChain(
    contributorPubkey: string,
    projectPda: string,
  ): Promise<Buffer> {
    return this.tx.wrapChainCall(async () => {
      const contributor = toPublicKey(contributorPubkey);
      const project = toPublicKey(projectPda);
      const projectAccount = await this.tx.fetchProject(project);
      const donorTokenAccount = this.tx.getAssociatedTokenAccount(
        projectAccount.usdcMint,
        contributor,
      );
      const setupInstructions = await this.tx.createAtaIfMissing(
        contributor,
        donorTokenAccount,
        contributor,
        projectAccount.usdcMint,
      );

      const instruction = await this.provider.program.methods
        .claimRefund()
        .accountsStrict({
          project,
          escrowVault: deriveEscrowVaultPda(project, this.provider.programId),
          contribution: deriveContributionPda(
            project,
            contributor,
            this.provider.programId,
          ),
          escrowTokenAccount: projectAccount.escrowTokenAccount,
          donorTokenAccount,
          contributor,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction();

      return this.tx.serialize(contributor, [
        ...setupInstructions,
        instruction,
      ]);
    });
  }

  getProjectPda(ownerPubkey: string, projectId: ChainAmount): string {
    return deriveProjectPda(
      toPublicKey(ownerPubkey),
      projectId,
      this.provider.programId,
    ).toBase58();
  }

  getEscrowVaultPda(projectPda: string): string {
    return deriveEscrowVaultPda(
      toPublicKey(projectPda),
      this.provider.programId,
    ).toBase58();
  }

  getMilestonePda(projectPda: string, milestoneOrder: ChainAmount): string {
    return deriveMilestonePda(
      toPublicKey(projectPda),
      milestoneOrder,
      this.provider.programId,
    ).toBase58();
  }

  getContributionPda(projectPda: string, contributorPubkey: string): string {
    return deriveContributionPda(
      toPublicKey(projectPda),
      toPublicKey(contributorPubkey),
      this.provider.programId,
    ).toBase58();
  }

  getVotePda(milestonePda: string, voterPubkey: string): string {
    return deriveVotePda(
      toPublicKey(milestonePda),
      toPublicKey(voterPubkey),
      this.provider.programId,
    ).toBase58();
  }

  async getMilestoneStatus(
    milestonePda: string,
  ): Promise<OnChainMilestoneStatus> {
    return this.tx.wrapChainCall(async () => {
      const account = await this.tx.fetchMilestone(toPublicKey(milestonePda));

      return this.normalizeMilestoneStatus(account.status);
    });
  }

  async verifyTransaction(
    signature: string,
    expected: ExpectedOnChainTransaction,
  ): Promise<TransactionVerificationResult> {
    return this.tx.wrapChainCall(async () => {
      const statusResponse =
        await this.provider.connection.getSignatureStatuses([signature], {
          searchTransactionHistory: true,
        });
      const status = statusResponse.value[0];

      if (!status) {
        return { status: 'PENDING', signature };
      }

      if (status.err) {
        return {
          status: 'FAILED',
          signature,
          slot: BigInt(status.slot),
          confirmationStatus: status.confirmationStatus,
          error: status.err,
        };
      }

      if (
        status.confirmationStatus !== 'confirmed' &&
        status.confirmationStatus !== 'finalized'
      ) {
        return {
          status: 'PENDING',
          signature,
          slot: BigInt(status.slot),
          confirmationStatus: status.confirmationStatus,
        };
      }

      const transaction = await this.provider.connection.getParsedTransaction(
        signature,
        {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        },
      );

      if (!transaction) {
        return {
          status: 'PENDING',
          signature,
          slot: BigInt(status.slot),
          confirmationStatus: status.confirmationStatus,
        };
      }

      if (transaction.meta?.err) {
        return {
          status: 'FAILED',
          signature,
          slot: BigInt(transaction.slot),
          confirmationStatus: status.confirmationStatus,
          logs: transaction.meta?.logMessages ?? [],
          error: transaction.meta.err,
        };
      }

      this.assertExpectedTransaction(transaction, expected);

      return {
        status: 'CONFIRMED',
        signature,
        slot: BigInt(transaction.slot),
        confirmationStatus: status.confirmationStatus,
        logs: transaction.meta?.logMessages ?? [],
      };
    });
  }

  private assertExpectedTransaction(
    transaction: ParsedTransactionWithMeta | null,
    expected: ExpectedOnChainTransaction,
  ) {
    if (!transaction) {
      throw new BadRequestException('Solana transaction was not found');
    }

    const accountKeys = transaction.transaction.message.accountKeys;
    const accountKeySet = new Set(
      accountKeys.map(({ pubkey }) => pubkey.toBase58()),
    );
    const signedByWallet = accountKeys.some(
      ({ pubkey, signer }) =>
        signer && pubkey.toBase58() === expected.wallet,
    );

    if (!signedByWallet) {
      throw new BadRequestException(
        'Transaction was not signed by the expected wallet',
      );
    }

    const programId = this.provider.programId.toBase58();
    const calledProgram = transaction.transaction.message.instructions.some(
      (instruction) => instruction.programId.toBase58() === programId,
    );

    if (!calledProgram) {
      throw new BadRequestException(
        'Transaction did not call the ProofLab program',
      );
    }

    const logs = transaction.meta?.logMessages ?? [];
    const expectedLog = operationLogLabels[expected.operation];

    if (!logs.some((log) => log.includes(expectedLog))) {
      throw new BadRequestException(
        `Transaction did not execute ${expected.operation}`,
      );
    }

    this.assertAccountPresent(accountKeySet, expected.wallet, 'wallet');
    this.assertAccountPresent(
      accountKeySet,
      expected.expectedProjectAddress,
      'project',
    );
    this.assertAccountPresent(
      accountKeySet,
      expected.expectedEscrowVaultAddress,
      'escrow vault',
    );
    this.assertAccountPresent(
      accountKeySet,
      expected.expectedContributionAddress,
      'contribution',
    );
    this.assertAccountPresent(
      accountKeySet,
      expected.expectedMilestoneAddress,
      'milestone',
    );
    this.assertAccountPresent(
      accountKeySet,
      expected.expectedVoteAddress,
      'vote',
    );
  }

  private assertAccountPresent(
    accountKeys: Set<string>,
    account?: string | null,
    label?: string,
  ) {
    if (!account) return;

    if (!accountKeys.has(account)) {
      throw new BadRequestException(
        `Transaction does not include the expected ${label ?? 'account'}`,
      );
    }
  }

  private normalizeMilestoneStatus(status: unknown): OnChainMilestoneStatus {
    if (typeof status === 'number') {
      switch (status) {
        case 0:
          return 'CREATED';
        case 1:
          return 'PENDING_REVIEW';
        case 2:
          return 'APPROVED';
        case 3:
          return 'REJECTED';
        case 4:
          return 'RELEASED';
        default:
          throw new BadRequestException('Unknown on-chain milestone status');
      }
    }

    const rawStatus =
      typeof status === 'string'
        ? status
        : status && typeof status === 'object'
          ? Object.keys(status)[0]
          : null;

    switch (rawStatus) {
      case 'created':
      case 'Created':
        return 'CREATED';
      case 'pendingReview':
      case 'PendingReview':
      case 'pending_review':
        return 'PENDING_REVIEW';
      case 'approved':
      case 'Approved':
        return 'APPROVED';
      case 'rejected':
      case 'Rejected':
        return 'REJECTED';
      case 'released':
      case 'Released':
        return 'RELEASED';
      default:
        throw new BadRequestException('Unknown on-chain milestone status');
    }
  }
}
