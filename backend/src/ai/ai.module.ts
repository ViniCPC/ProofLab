import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiClient } from './ai.client';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiClient, AiService],
  exports: [AiService],
})
export class AiModule {}
