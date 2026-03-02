import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { getUser } from './common/utils/user';
import { DashboardStats, UserSupportDto } from './app.controller.i';
import { Public } from './common/guard/guard';

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
  insertUserSupport(@Body() body: UserSupportDto) {
    return this.appService.insertUserSupport(body)
  }

  @Get('config')
  getConfig(@Req() req: Request) {
    const user = getUser(req);
    return this.appService.getConfig(user.id)
  }


  @Post('update-export-link')
  updateExportLink(@Body() dto: { cmtIds: number[], linkId: number }) {
    return this.appService.updateExportLink(dto.linkId, dto.cmtIds)
  }
}
