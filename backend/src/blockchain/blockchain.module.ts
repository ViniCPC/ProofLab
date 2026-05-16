import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainProvider } from './blockchain.provider';
import { BlockchainService } from './blockchain.service';
import { BlockchainTx } from './blockchain.tx';

@Module({
  imports: [ConfigModule],
  providers: [BlockchainProvider, BlockchainTx, BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
