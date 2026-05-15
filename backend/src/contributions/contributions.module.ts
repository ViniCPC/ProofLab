import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';

@Module({
  imports: [AuthModule, BlockchainModule, PrismaModule],
  controllers: [ContributionsController],
  providers: [ContributionsService],
})
export class ContributionsModule {}
