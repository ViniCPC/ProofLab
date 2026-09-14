import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMilestoneDto {
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
