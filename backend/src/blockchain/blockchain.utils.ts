import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type ChainAmount = BN | bigint | number | string;

export function toBN(value: ChainAmount): BN {
  if (BN.isBN(value)) {
    return value;
  }

  return new BN(value.toString(), 10);
}

export function u64Seed(value: ChainAmount): Buffer {
  return toBN(value).toArrayLike(Buffer, 'le', 8);
}

export function toPublicKey(value: string | PublicKey): PublicKey {
  if (value instanceof PublicKey) {
    return value;
  }

  try {
    return new PublicKey(value);
  } catch {
    throw new BadRequestException(`Invalid Solana public key: ${value}`);
  }
}

export function publicKeyField(
  account: Record<string, unknown>,
  camelCaseField: string,
  snakeCaseField: string,
): PublicKey {
  const value = account[camelCaseField] ?? account[snakeCaseField];

  if (value instanceof PublicKey) {
    return value;
  }

  if (typeof value === 'string') {
    return toPublicKey(value);
  }

  throw new ServiceUnavailableException(
    `Project account field ${camelCaseField} is missing`,
  );
}
