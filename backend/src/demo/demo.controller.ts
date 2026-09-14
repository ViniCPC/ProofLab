import { ApiSecurity } from '@nestjs/swagger';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DemoAdminGuard } from './demo-admin.guard';
import { ApplyDemoScenarioDto } from './dto/apply-demo-scenario.dto';
import { DemoService } from './demo.service';

@Controller('demo')
export class DemoController {
  constructor(
    private readonly demoService: DemoService,
    private readonly demoAdminGuard: DemoAdminGuard,
  ) {}

  @Get()
  async getSummary() {
    return this.withCapabilities(await this.demoService.getSummary());
  }

  @Post('seed')
  @ApiSecurity('demo-admin')
  @UseGuards(DemoAdminGuard)
  async seed() {
    return this.withCapabilities(await this.demoService.seed());
  }

  @Post('scenario')
  @ApiSecurity('demo-admin')
  @UseGuards(DemoAdminGuard)
  async applyScenario(@Body() body: ApplyDemoScenarioDto) {
    return this.withCapabilities(
      await this.demoService.applyScenario(body.scenario),
    );
  }

  private withCapabilities(
    summary: Awaited<ReturnType<DemoService['getSummary']>>,
  ) {
    return {
      ...summary,
      mutationsEnabled: this.demoAdminGuard.arePublicMutationsEnabled(),
    };
  }
}
