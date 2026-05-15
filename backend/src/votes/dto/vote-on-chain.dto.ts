import { IsBoolean } from 'class-validator';

export class VoteOnChainDto {
  @IsBoolean()
  approve!: boolean;
}
