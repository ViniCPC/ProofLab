import { Injectable } from '@nestjs/common';
import { SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
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
}
