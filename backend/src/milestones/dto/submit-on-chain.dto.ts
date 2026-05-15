import { IsInt, IsPositive } from 'class-validator';

export class SubmitOnChainDto {
  @IsInt()
  @IsPositive()
  votingDurationSeconds!: number;
}
