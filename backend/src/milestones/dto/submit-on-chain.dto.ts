import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class SubmitOnChainDto {
  @IsInt()
  @IsPositive()
  @ApiProperty({ type: Number, minimum: 1, example: 86400 })
  votingDurationSeconds!: number;
}
