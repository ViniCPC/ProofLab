import {
  BadRequestException,
  type HttpException,
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
import { BlockchainProvider } from './blockchain.provider';
import { publicKeyField, toPublicKey } from './blockchain.utils';

export interface ResearchProjectAccount {
  usdcMint: PublicKey;
  escrowTokenAccount: PublicKey;
}

export interface MilestoneAccount {
  status: unknown;
}

const MILESTONE_STATUS_OFFSET = 8 + 32 + 8 + 8;
const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

function getAssociatedTokenAddressSync(
  mint: PublicKey,
  owner: PublicKey,
): PublicKey {
  if (!PublicKey.isOnCurve(owner.toBuffer())) {
    throw new BadRequestException('Token account owner must be on curve');
  }

  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  return address;
}

function createAssociatedTokenAccountInstruction(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedToken, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.alloc(0),
  });
}

@Injectable()
export class BlockchainTx {
  constructor(
    private readonly provider: BlockchainProvider,
    private readonly config: ConfigService,
  ) {}

  async serialize(
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

  async fetchProject(project: PublicKey): Promise<ResearchProjectAccount> {
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
      throw this.mapChainError(
        error,
        `Project not found on-chain: ${project.toBase58()}`,
      );
    }
  }

  async fetchMilestone(milestone: PublicKey): Promise<MilestoneAccount> {
    const account = await this.provider.connection.getAccountInfo(milestone);

    if (!account) {
      throw new NotFoundException(
        `Milestone not found on-chain: ${milestone.toBase58()}`,
      );
    }

    if (!account.owner.equals(this.provider.programId)) {
      throw new BadRequestException('Milestone account owner is invalid');
    }

    if (account.data.length <= MILESTONE_STATUS_OFFSET) {
      throw new BadRequestException('Milestone account data is invalid');
    }

    return {
      status: account.data[MILESTONE_STATUS_OFFSET],
    };
  }

  async createAtaIfMissing(
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
      ),
    ];
  }

  getAssociatedTokenAccount(mint: PublicKey, owner: PublicKey) {
    return getAssociatedTokenAddressSync(
      mint,
      owner,
    );
  }

  getUsdcMint(): PublicKey {
    const mint = this.config.get<string>('USDC_MINT_ADDRESS');

    if (!mint) {
      throw new ServiceUnavailableException('USDC_MINT_ADDRESS is required');
    }

    return toPublicKey(mint);
  }

  async wrapChainCall<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw this.mapChainError(error);
    }
  }

  mapChainError(error: unknown, notFoundMessage?: string): HttpException {
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
