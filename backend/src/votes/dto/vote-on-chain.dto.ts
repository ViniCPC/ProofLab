import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class VoteOnChainDto {
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  approve!: boolean;
}
