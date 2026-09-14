import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateMilestoneStatusDto {
  @IsIn(['SUBMITTED', 'APPROVED', 'REJECTED'])
  @ApiProperty({ enum: ['SUBMITTED', 'APPROVED', 'REJECTED'] })
  status!: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}
