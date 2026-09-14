import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SubmitMilestoneReviewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  @ApiProperty({ type: String })
  submittedReport!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  @ApiProperty({ type: Number, minimum: 0, maximum: 100, example: 80 })
  progress!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  @ApiProperty({ type: String })
  evidenceText!: string;
}
