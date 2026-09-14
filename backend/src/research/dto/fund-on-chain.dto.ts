import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsNumber } from 'class-validator';

export class FundOnChainDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty({ type: Number, example: 100 })
  amount!: number;
}
