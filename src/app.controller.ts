import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    /*
     * Health Checks are good to do here, not just testing if the system responds,
     * but should check if it's upstream services do as well (e.g. databases)
     */
    return this.appService.getHello();
  }
}
