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
  submittedReport!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  progress!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  evidenceText!: string;
}
