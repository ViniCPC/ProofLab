import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';

@Module({
  imports: [AiModule, AuthModule, BlockchainModule, PrismaModule],
  controllers: [ResearchController],
  providers: [ResearchService],
})
export class ResearchModule {}
