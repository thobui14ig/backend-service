import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { getUser } from './common/utils/user';
import { DashboardStats, UserSupportDto } from './app.controller.i';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('dashboard-stats')
  getDashboardStats(@Req() req: Request, @Body() body: { timezone: string }): Promise<DashboardStats> {
    const user = getUser(req);
    return this.appService.getDashboardStats(user, body.timezone);
  }

  @Get('/user-support')
  getUserSupport() {
    return this.appService.getUserSupport()
  }

  @Post('/insert-user-support')
  insertUserSupport(@Body() body: UserSupportDto) {
    return this.appService.insertUserSupport(body)
  }
}
