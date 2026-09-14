import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class AnalyzeResearchMilestoneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  @ApiProperty({ type: String })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  @ApiProperty({ type: String })
  description!: string;

  @IsDecimal({ decimal_digits: '0,6' })
  @ApiProperty({ type: String, example: '1000.000000' })
  amount!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ type: Number, minimum: 1, example: 1 })
  order!: number;
}

export class AnalyzeResearchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @ApiProperty({ type: String })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  @ApiProperty({ type: String })
  description!: string;

  @IsDecimal({ decimal_digits: '0,6' })
  @ApiProperty({ type: String, example: '1000.000000' })
  totalAmount!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => AnalyzeResearchMilestoneDto)
  @ApiPropertyOptional({
    type: () => AnalyzeResearchMilestoneDto,
    isArray: true,
    maxItems: 50,
  })
  milestones?: AnalyzeResearchMilestoneDto[];
}
