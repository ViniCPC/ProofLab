import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  applyDemoScenario,
  getDemoSummary,
  seedDemoData,
  type DemoScenario,
} from './demo.seed';

@Injectable()
export class DemoService {
  constructor(private readonly prisma: PrismaService) {}

  getSummary() {
    return getDemoSummary(this.prisma);
  }

  seed() {
    return seedDemoData(this.prisma);
  }

  applyScenario(scenario: DemoScenario) {
    return applyDemoScenario(this.prisma, scenario);
  }
}
