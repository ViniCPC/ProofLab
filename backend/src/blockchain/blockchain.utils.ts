import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { Prisma } from '@prisma/client';

export type ChainAmount = BN | bigint | number | string;

const USDC_DECIMALS = 6;
const USDC_BASE = 10n ** BigInt(USDC_DECIMALS);

export function toUsdcBaseUnits(
  value: Prisma.Decimal | string | number,
): string {
  const text = value.toString();

  if (!/^\d+(\.\d{1,6})?$/.test(text)) {
    throw new BadRequestException(
      'Amount must have at most 6 decimal places',
    );
  }

  const [whole, fraction = ''] = text.split('.');
  const paddedFraction = `${fraction}${'0'.repeat(USDC_DECIMALS)}`.slice(
    0,
    USDC_DECIMALS,
  );

  return (
    BigInt(whole) * USDC_BASE +
    BigInt(paddedFraction || '0')
  ).toString();
}

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
