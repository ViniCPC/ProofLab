import { IsIn } from 'class-validator';
import { demoScenarios, type DemoScenario } from '../demo.seed';

export class ApplyDemoScenarioDto {
  @IsIn(demoScenarios)
  scenario!: DemoScenario;
}
