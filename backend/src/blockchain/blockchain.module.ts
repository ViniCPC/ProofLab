import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainProvider } from './blockchain.provider';
import { BlockchainService } from './blockchain.service';

@Module({
  imports: [ConfigModule],
  providers: [BlockchainProvider, BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
