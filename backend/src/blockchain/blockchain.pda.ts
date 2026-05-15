import { PublicKey } from '@solana/web3.js';
import { ChainAmount, u64Seed } from './blockchain.utils';

export function deriveProjectPda(
  owner: PublicKey,
  projectId: ChainAmount,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('project'), owner.toBuffer(), u64Seed(projectId)],
    programId,
  )[0];
}

export function deriveEscrowVaultPda(
  project: PublicKey,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), project.toBuffer()],
    programId,
  )[0];
}

export function deriveEscrowTokenAccountPda(
  project: PublicKey,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow-token'), project.toBuffer()],
    programId,
  )[0];
}

export function deriveMilestonePda(
  project: PublicKey,
  milestoneOrder: ChainAmount,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('milestone'), project.toBuffer(), u64Seed(milestoneOrder)],
    programId,
  )[0];
}

export function deriveContributionPda(
  project: PublicKey,
  contributor: PublicKey,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('contribution'), project.toBuffer(), contributor.toBuffer()],
    programId,
  )[0];
}

export function deriveVotePda(
  milestone: PublicKey,
  voter: PublicKey,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vote'), milestone.toBuffer(), voter.toBuffer()],
    programId,
  )[0];
}
