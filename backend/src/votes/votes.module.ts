import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PrismaModule } from '../prisma/prisma.module';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';

@Module({
  imports: [AuthModule, BlockchainModule, PrismaModule],
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule {}
