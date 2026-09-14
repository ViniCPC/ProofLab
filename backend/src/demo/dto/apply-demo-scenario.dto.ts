import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { demoScenarios, type DemoScenario } from '../demo.seed';

export class ApplyDemoScenarioDto {
  @IsIn(demoScenarios)
  @ApiProperty({ enum: demoScenarios, example: 'funding' })
  scenario!: DemoScenario;
}
