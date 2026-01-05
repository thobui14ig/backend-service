import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { getUser } from './common/utils/user';
import { DashboardStats } from './app.controller.i';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('dashboard-stats')
  getDashboardStats(@Req() req: Request): Promise<DashboardStats> {
    const user = getUser(req);
    return this.appService.getDashboardStats(user);
  }
}
