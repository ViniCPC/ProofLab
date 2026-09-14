import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CreateVoteDto {
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  approve!: boolean;
}
