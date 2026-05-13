import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './types/authenticated-request';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async walletLogin(walletAddress: string) {
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
}
