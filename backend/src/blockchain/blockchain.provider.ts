import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnchorProvider, Idl, Program, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { ResearchEscrow } from '../../../solana/target/types/research_escrow';

@Injectable()
export class BlockchainProvider implements OnModuleInit {
  private readonly logger = new Logger(BlockchainProvider.name);

  program!: Program<ResearchEscrow>;
  programId!: PublicKey;
  connection!: Connection;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const rpcUrl =
      this.config.get<string>('SOLANA_RPC_URL') ??
      'https://api.devnet.solana.com';
    const idl = this.loadIdl();
    const configuredProgramId =
      this.config.get<string>('SOLANA_PROGRAM_ID') ?? idl.address;

    if (!configuredProgramId) {
      throw new ServiceUnavailableException(
        'SOLANA_PROGRAM_ID is required when the IDL has no address',
      );
    }

    idl.address = configuredProgramId;
    this.programId = new PublicKey(configuredProgramId);
    this.connection = new Connection(rpcUrl, 'confirmed');

    const wallet = new Wallet(this.getProviderKeypair());
    const provider = new AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });

    this.program = new Program<ResearchEscrow>(idl as ResearchEscrow, provider);
    this.logger.log(
      `Solana program ${this.programId.toBase58()} configured for ${rpcUrl}`,
    );
  }

  private loadIdl(): Idl & { address?: string } {
    const configuredPath = this.config.get<string>('SOLANA_IDL_PATH');
    const candidatePaths = [
      configuredPath ? resolve(configuredPath) : undefined,
      resolve(process.cwd(), '../solana/target/idl/research_escrow.json'),
      resolve(process.cwd(), 'solana/target/idl/research_escrow.json'),
      join(__dirname, '../../../solana/target/idl/research_escrow.json'),
    ].filter(Boolean) as string[];

    const idlPath = candidatePaths.find((path) => existsSync(path));

    if (!idlPath) {
      throw new ServiceUnavailableException(
        'Anchor IDL not found. Run `anchor build` in the solana folder or set SOLANA_IDL_PATH.',
      );
    }

    return JSON.parse(readFileSync(idlPath, 'utf8')) as Idl & {
      address?: string;
    };
  }

  private getProviderKeypair(): Keypair {
    const rawKeypair = this.config.get<string>('SOLANA_ADMIN_KEYPAIR');

    if (!rawKeypair) {
      this.logger.warn(
        'SOLANA_ADMIN_KEYPAIR is not configured. Using an ephemeral provider wallet only for transaction building.',
      );
      return Keypair.generate();
    }

    try {
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(rawKeypair)));
    } catch {
      throw new ServiceUnavailableException(
        'SOLANA_ADMIN_KEYPAIR must be a JSON array secret key',
      );
    }
  }
}
