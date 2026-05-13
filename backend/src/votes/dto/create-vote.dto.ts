import { IsBoolean } from 'class-validator';

export class CreateVoteDto {
  @IsBoolean()
  approve!: boolean;
}
