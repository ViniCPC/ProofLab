import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DemoAdminGuard } from './demo-admin.guard';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

@Module({
  imports: [PrismaModule],
  controllers: [DemoController],
  providers: [DemoService, DemoAdminGuard],
})
export class DemoModule {}
