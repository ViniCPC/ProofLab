import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ContributionsModule } from './contributions/contributions.module';
import { validateEnvironment } from './config/environment';
import { MilestonesModule } from './milestones/milestones.module';
import { ResearchModule } from './research/research.module';
import { VotesModule } from './votes/votes.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 60 }],
      errorMessage:
        'Muitas requisições em pouco tempo. Aguarde um minuto e tente novamente.',
    }),
    AiModule,
    AuthModule,
    BlockchainModule,
    ResearchModule,
    MilestonesModule,
    ContributionsModule,
    VotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
