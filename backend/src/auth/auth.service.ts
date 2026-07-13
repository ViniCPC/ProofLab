import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import nacl from 'tweetnacl';
import { toPublicKey } from '../blockchain/blockchain.utils';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './types/authenticated-request';

const NONCE_TTL_MS = 5 * 60 * 1000;

interface NonceRecord {
  message: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly nonces = new Map<string, NonceRecord>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  requestNonce(walletAddress: string) {
    toPublicKey(walletAddress);

    const nonce = randomBytes(16).toString('hex');
    const message = [
      'ProofLab wants you to sign in with your Solana account:',
      walletAddress,
      '',
      `Nonce: ${nonce}`,
      `Issued At: ${new Date().toISOString()}`,
    ].join('\n');

    this.nonces.set(walletAddress, {
      message,
      expiresAt: Date.now() + NONCE_TTL_MS,
    });

    return { message };
  }

  async walletLogin(walletAddress: string, signature: string) {
    const record = this.nonces.get(walletAddress);

    if (!record || record.expiresAt < Date.now()) {
      this.nonces.delete(walletAddress);
      throw new UnauthorizedException(
        'Nonce expired or not found, request a new one',
      );
    }

    if (!this.verifySignature(walletAddress, record.message, signature)) {
      throw new UnauthorizedException('Invalid wallet signature');
    }

    this.nonces.delete(walletAddress);

    const user = await this.usersService.findOrCreate(walletAddress);
    const token = this.jwtService.sign({
      sub: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
    });

    return {
      accessToken: token,
      tokenType: 'Bearer',
      user,
    };
  }

  async validateToken(token: string) {
    const payload = this.jwtService.verify<JwtPayload>(token);
    const user = await this.usersService.findById(payload.sub);

    if (!user || user.walletAddress !== payload.walletAddress) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }

  private verifySignature(
    walletAddress: string,
    message: string,
    signatureBase64: string,
  ): boolean {
    try {
      const publicKey = toPublicKey(walletAddress);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = Buffer.from(signatureBase64, 'base64');

      return nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes(),
      );
    } catch {
      return false;
    }
  }
}
