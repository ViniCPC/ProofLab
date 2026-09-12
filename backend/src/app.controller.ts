import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      message: 'ProofLab API is running',
    };
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}