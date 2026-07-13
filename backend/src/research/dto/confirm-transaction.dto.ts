import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmTransactionDto {
  @IsString()
  @IsNotEmpty()
  requestId!: string;

  @IsString()
  @IsNotEmpty()
  signature!: string;
}
