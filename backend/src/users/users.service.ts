import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export type PublicUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(walletAddress: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (existingUser) {
      return this.toPublicUser(existingUser);
    }

    const walletHash = createHash('sha256').update(walletAddress).digest('hex');
    const user = await this.prisma.user.create({
      data: {
        name: this.buildWalletName(walletAddress),
        email: `wallet-${walletHash.slice(0, 24)}@prooflab.local`,
        walletAddress,
      },
    });

    return this.toPublicUser(user);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toPublicUser(user) : null;
  }

  private buildWalletName(walletAddress: string) {
    if (walletAddress.length <= 10) {
      return `Wallet ${walletAddress}`;
    }

    return `Wallet ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
      reputation: user.reputation,
      createdAt: user.createdAt,
    };
  }
}
