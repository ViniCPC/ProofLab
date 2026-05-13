import { IsDecimal, Matches } from 'class-validator';

export class CreateContributionDto {
  @IsDecimal({ decimal_digits: '0,6' })
  @Matches(/^(?!0+(\.0{1,6})?$)\d+(\.\d{1,6})?$/, {
    message: 'amount must be greater than zero',
  })
  amount!: string;
}
