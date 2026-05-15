import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApplyDemoScenarioDto } from './dto/apply-demo-scenario.dto';
import { DemoService } from './demo.service';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Get()
  getSummary() {
    return this.demoService.getSummary();
  }

  @Post('seed')
  seed() {
    return this.demoService.seed();
  }

  @Post('scenario')
  applyScenario(@Body() body: ApplyDemoScenarioDto) {
    return this.demoService.applyScenario(body.scenario);
  }
}
