import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { getUser } from './common/utils/user';
import { DashboardStats, RequestSong } from './app.controller.i';
import { Public } from './common/guard/guard';
import { Role, Roles } from './common/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('export-link/:linkId')
  getExportLink(@Param('linkId') linkId: number) {
    return this.appService.getExportLink(linkId)
  }

  @Post('dashboard-stats')
  getDashboardStats(@Req() req: Request, @Body() body: { timezone: string }): Promise<DashboardStats> {
    const user = getUser(req);
    return this.appService.getDashboardStats(user, body.timezone);
  }

  @Public()
  @Get('/user-support')
  getUserSupport() {
    return this.appService.getUserSupport()
  }

  @Public()
  @Post('/insert-user-support')
  insertUserSupport(@Body() body: RequestSong) {
    return this.appService.insertUserSupport(body)
  }

  @Get('config')
  getConfig(@Req() req: Request) {
    const user = getUser(req);
    return this.appService.getConfig(user.id)
  }


  @Get('fb-number')
  @Roles(Role.ADMIN)
  getFbNumber() {
    return this.appService.getFbNumber()
  }
}
