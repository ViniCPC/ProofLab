import { IsPositive, IsNumber } from 'class-validator';

export class FundOnChainDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
}
