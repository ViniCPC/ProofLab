import { IsIn } from 'class-validator';

export class UpdateMilestoneStatusDto {
  @IsIn(['SUBMITTED', 'APPROVED', 'REJECTED'])
  status!: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}
