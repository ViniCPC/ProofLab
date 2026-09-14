import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmTransactionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  requestId!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Solana transaction signature' })
  signature!: string;
}
