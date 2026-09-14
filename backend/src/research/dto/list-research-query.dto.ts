import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListResearchQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ type: Number, minimum: 1, default: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({ type: Number, minimum: 1, maximum: 100, default: 10 })
  limit?: number = 10;
}
