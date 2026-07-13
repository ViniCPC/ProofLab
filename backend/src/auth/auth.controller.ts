import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { RequestNonceDto } from './dto/request-nonce.dto';
import { WalletLoginDto } from './dto/wallet-login.dto';
import type { AuthenticatedRequest } from './types/authenticated-request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('nonce')
  requestNonce(@Body() body: RequestNonceDto) {
    return this.authService.requestNonce(body.walletAddress);
  }

  @Post('wallet-login')
  walletLogin(@Body() body: WalletLoginDto) {
    return this.authService.walletLogin(body.walletAddress, body.signature);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}
