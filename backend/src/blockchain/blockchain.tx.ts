import {
  BadRequestException,
  type HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
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

export type OnChainProjectStatus =
  | 'Funding'
  | 'Active'
  | 'Completed'
  | 'Cancelled';

export interface ResearchProjectAccount {
  usdcMint: PublicKey;
  escrowTokenAccount: PublicKey;
  status: OnChainProjectStatus;
}

export interface MilestoneAccount {
  status: unknown;
  /** Unix timestamp (seconds) when voting closes. */
  deadline: number;
}

// discriminator + project + order + amount
const MILESTONE_STATUS_OFFSET = 8 + 32 + 8 + 8;
// status (1) + votes_yes (8) + votes_no (8)
const MILESTONE_DEADLINE_OFFSET = MILESTONE_STATUS_OFFSET + 1 + 8 + 8;
// discriminator + project + contributor
const CONTRIBUTION_AMOUNT_OFFSET = 8 + 32 + 32;
const PROJECT_STATUSES: Record<string, OnChainProjectStatus> = {
  funding: 'Funding',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function normalizeProjectStatus(status: unknown): OnChainProjectStatus {
  const rawStatus =
    typeof status === 'string'
      ? status
      : status && typeof status === 'object'
        ? Object.keys(status)[0]
        : null;
  const normalized = rawStatus
    ? PROJECT_STATUSES[rawStatus.toLowerCase()]
    : null;

  if (!normalized) {
    throw new BadRequestException('Status do projeto desconhecido na Solana.');
  }

  return normalized;
}
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
    throw new BadRequestException(
      'A conta de token precisa pertencer a uma wallet válida.',
    );
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
  private readonly logger = new Logger(BlockchainTx.name);

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
        status: normalizeProjectStatus(
          (account as Record<string, unknown>).status,
        ),
      };
    } catch (error) {
      throw this.mapChainError(
        error,
        `Projeto não encontrado na Solana: ${project.toBase58()}.`,
      );
    }
  }

  async fetchMilestone(milestone: PublicKey): Promise<MilestoneAccount> {
    const account = await this.provider.connection.getAccountInfo(milestone);

    if (!account) {
      throw new NotFoundException(
        `Etapa não encontrada na Solana: ${milestone.toBase58()}.`,
      );
    }

    if (!account.owner.equals(this.provider.programId)) {
      throw new BadRequestException(
        'A conta da etapa não pertence ao programa ProofLab.',
      );
    }

    if (account.data.length < MILESTONE_DEADLINE_OFFSET + 8) {
      throw new BadRequestException(
        'Os dados da conta da etapa são inválidos.',
      );
    }

    return {
      status: account.data[MILESTONE_STATUS_OFFSET],
      deadline: Number(account.data.readBigInt64LE(MILESTONE_DEADLINE_OFFSET)),
    };
  }

  async fetchContributionAmount(contribution: PublicKey): Promise<bigint> {
    const account = await this.provider.connection.getAccountInfo(contribution);

    if (!account) {
      throw new NotFoundException(
        `Contribuição não encontrada na Solana: ${contribution.toBase58()}.`,
      );
    }

    if (!account.owner.equals(this.provider.programId)) {
      throw new BadRequestException(
        'A conta da contribuição não pertence ao programa ProofLab.',
      );
    }

    if (account.data.length < CONTRIBUTION_AMOUNT_OFFSET + 8) {
      throw new BadRequestException(
        'Os dados da conta da contribuição são inválidos.',
      );
    }

    return account.data.readBigUInt64LE(CONTRIBUTION_AMOUNT_OFFSET);
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

    return [createAssociatedTokenAccountInstruction(payer, ata, owner, mint)];
  }

  getAssociatedTokenAccount(mint: PublicKey, owner: PublicKey) {
    return getAssociatedTokenAddressSync(mint, owner);
  }

  getUsdcMint(): PublicKey {
    const mint = this.config.get<string>('USDC_MINT_ADDRESS');

    if (!mint) {
      throw new ServiceUnavailableException(
        'Servidor sem USDC_MINT_ADDRESS configurado.',
      );
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

    // Raw RPC messages stay in the logs; the client gets a readable one.
    this.logger.warn(`Solana call failed: ${message}`);

    if (
      message.includes('Account does not exist') ||
      message.includes('has no data')
    ) {
      return new NotFoundException(
        notFoundMessage ?? 'Conta não encontrada na Solana.',
      );
    }

    if (
      message.includes('Invalid public key') ||
      message.includes('Non-base58')
    ) {
      return new BadRequestException('Endereço Solana inválido.');
    }

    if (
      message.includes('blockhash') ||
      message.includes('fetch failed') ||
      message.includes('429')
    ) {
      return new ServiceUnavailableException(
        'A rede Solana não respondeu. Tente novamente em instantes.',
      );
    }

    return new InternalServerErrorException(
      'Não foi possível montar a transação na Solana. Tente novamente.',
    );
  }
}
