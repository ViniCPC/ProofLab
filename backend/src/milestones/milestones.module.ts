import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';

@Module({
  imports: [AiModule, AuthModule, BlockchainModule, PrismaModule],
  controllers: [MilestonesController],
  providers: [MilestonesService],
})
export class MilestonesModule {}
