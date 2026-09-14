import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class CreateMilestoneOnChainDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'Deadline as a Unix timestamp in seconds',
  })
  deadlineUnixTimestamp?: number;
}
