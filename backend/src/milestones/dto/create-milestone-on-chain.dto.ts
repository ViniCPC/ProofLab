import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class CreateMilestoneOnChainDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  deadlineUnixTimestamp?: number;
}
