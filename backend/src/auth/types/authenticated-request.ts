import type { Request } from 'express';
import type { PublicUser } from '../../users/users.service';

export type JwtPayload = {
  sub: string;
  walletAddress: string;
  role: PublicUser['role'];
  iat?: number;
  exp?: number;
};

export type AuthenticatedRequest = Request & {
  user?: PublicUser;
};
