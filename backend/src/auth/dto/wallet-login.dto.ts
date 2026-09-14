import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class WalletLoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  @ApiProperty({ type: String, description: 'Solana public key of the wallet' })
  walletAddress!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @ApiProperty({
    type: String,
    description: 'Base64 signature of the exact nonce message',
  })
  signature!: string;
}
