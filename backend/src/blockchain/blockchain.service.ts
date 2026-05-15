import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { BlockchainProvider } from './blockchain.provider';
import {
  deriveContributionPda,
  deriveEscrowTokenAccountPda,
  deriveEscrowVaultPda,
  deriveMilestonePda,
  deriveProjectPda,
  deriveVotePda,
} from './blockchain.pda';
import {
  ChainAmount,
  publicKeyField,
  toBN,
  toPublicKey,
} from './blockchain.utils';

interface ResearchProjectAccount {
  usdcMint: PublicKey;
  escrowTokenAccount: PublicKey;
}

@Injectable()
export class BlockchainService {
  constructor(
    private readonly provider: BlockchainProvider,
    private readonly config: ConfigService,
  ) {}

  async createProjectOnChain(
    ownerPubkey: string,
    projectId: ChainAmount,
    title: string,
    totalAmount: ChainAmount,
  ): Promise<Buffer> {
    return this.wrapChainCall(async () => {
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
          usdcMint: this.getUsdcMint(),
          escrowTokenAccount,
          owner,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      return this.serializeForWallet(owner, [instruction]);
    });
  }

  async createMilestoneOnChain(
    ownerPubkey: string,
    projectPda: string,
    milestoneOrder: ChainAmount,
    amount: ChainAmount,
    deadline: ChainAmount,
  ): Promise<Buffer> {
    return this.wrapChainCall(async () => {
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

      return this.serializeForWallet(owner, [instruction]);
    });
  }

  async fundProjectOnChain(
    contributorPubkey: string,
    projectPda: string,
    amount: ChainAmount,
  ): Promise<Buffer> {
    return this.wrapChainCall(async () => {
      const contributor = toPublicKey(contributorPubkey);
      const project = toPublicKey(projectPda);
      const projectAccount = await this.fetchProject(project);

      const instruction = await this.provider.program.methods
        .fundProject(toBN(amount))
        .accountsStrict({
          project,
          escrowVault: deriveEscrowVaultPda(project, this.provider.programId),
          donorTokenAccount: this.getAssociatedTokenAccount(
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

      return this.serializeForWallet(contributor, [instruction]);
    });
  }

  async submitMilestoneOnChain(
    ownerPubkey: string,
    projectPda: string,
    milestoneOrder: ChainAmount,
    votingDurationSeconds: ChainAmount,
  ): Promise<Buffer> {
    return this.wrapChainCall(async () => {
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

      return this.serializeForWallet(owner, [instruction]);
    });
  }

  async voteMilestoneOnChain(
    voterPubkey: string,
    projectPda: string,
    milestoneOrder: ChainAmount,
    approve: boolean,
  ): Promise<Buffer> {
    return this.wrapChainCall(async () => {
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

      return this.serializeForWallet(voter, [instruction]);
    });
  }

  async finalizeMilestoneVoteOnChain(
    projectPda: string,
    milestoneOrder: ChainAmount,
    feePayerPubkey: string,
  ): Promise<Buffer> {
    return this.wrapChainCall(async () => {
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

      return this.serializeForWallet(feePayer, [instruction]);
    });
  }

  async releaseMilestoneOnChain(
    ownerPubkey: string,
    projectPda: string,
    milestoneOrder: ChainAmount,
  ): Promise<Buffer> {
    return this.wrapChainCall(async () => {
      const owner = toPublicKey(ownerPubkey);
      const project = toPublicKey(projectPda);
      const projectAccount = await this.fetchProject(project);
      const researcherTokenAccount = this.getAssociatedTokenAccount(
        projectAccount.usdcMint,
        owner,
      );
      const setupInstructions = await this.createAtaIfMissing(
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

      return this.serializeForWallet(owner, [
        ...setupInstructions,
        instruction,
      ]);
    });
  }

  async releaseFundsOnChain(
    ownerPubkey: string,
    projectPda: string,
    milestoneOrder: ChainAmount,
  ): Promise<Buffer> {
    return this.releaseMilestoneOnChain(
      ownerPubkey,
      projectPda,
      milestoneOrder,
    );
  }

  async claimRefundOnChain(
    contributorPubkey: string,
    projectPda: string,
  ): Promise<Buffer> {
    return this.wrapChainCall(async () => {
      const contributor = toPublicKey(contributorPubkey);
      const project = toPublicKey(projectPda);
      const projectAccount = await this.fetchProject(project);
      const donorTokenAccount = this.getAssociatedTokenAccount(
        projectAccount.usdcMint,
        contributor,
      );
      const setupInstructions = await this.createAtaIfMissing(
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

      return this.serializeForWallet(contributor, [
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

  private async serializeForWallet(
    feePayer: PublicKey,
    instructions: TransactionInstruction[],
  ): Promise<Buffer> {
    const { blockhash } =
      await this.provider.connection.getLatestBlockhash('confirmed');
    const message = new TransactionMessage({
      payerKey: feePayer,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    return Buffer.from(new VersionedTransaction(message).serialize());
  }

  private async fetchProject(
    project: PublicKey,
  ): Promise<ResearchProjectAccount> {
    try {
      const account =
        await this.provider.program.account.researchProject.fetch(project);

      return {
        usdcMint: publicKeyField(account, 'usdcMint', 'usdc_mint'),
        escrowTokenAccount: publicKeyField(
          account,
          'escrowTokenAccount',
          'escrow_token_account',
        ),
      };
    } catch (error) {
      throw this.mapChainError(error, `Project not found on-chain: ${project}`);
    }
  }

  private async createAtaIfMissing(
    payer: PublicKey,
    ata: PublicKey,
    owner: PublicKey,
    mint: PublicKey,
  ): Promise<TransactionInstruction[]> {
    const existingAccount = await this.provider.connection.getAccountInfo(ata);

    if (existingAccount) {
      return [];
    }

    return [
      createAssociatedTokenAccountInstruction(
        payer,
        ata,
        owner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    ];
  }

  private getAssociatedTokenAccount(mint: PublicKey, owner: PublicKey) {
    return getAssociatedTokenAddressSync(
      mint,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
  }

  private getUsdcMint(): PublicKey {
    const mint = this.config.get<string>('USDC_MINT_ADDRESS');

    if (!mint) {
      throw new ServiceUnavailableException('USDC_MINT_ADDRESS is required');
    }

    return toPublicKey(mint);
  }

  private async wrapChainCall<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw this.mapChainError(error);
    }
  }

  private mapChainError(error: unknown, notFoundMessage?: string) {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof ServiceUnavailableException
    ) {
      return error;
    }

    const message =
      error instanceof Error ? error.message : 'Unknown Solana RPC error';

    if (
      message.includes('Account does not exist') ||
      message.includes('has no data')
    ) {
      return new NotFoundException(notFoundMessage ?? message);
    }

    if (
      message.includes('Invalid public key') ||
      message.includes('Non-base58')
    ) {
      return new BadRequestException(message);
    }

    if (
      message.includes('blockhash') ||
      message.includes('fetch failed') ||
      message.includes('429')
    ) {
      return new ServiceUnavailableException(message);
    }

    return new InternalServerErrorException(message);
  }
}
