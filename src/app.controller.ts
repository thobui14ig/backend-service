import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { getUser } from './common/utils/user';
import { DashboardStats, RequestSong } from './app.controller.i';
import { Public } from './common/guard/guard';
import { Role, Roles } from './common/decorators/roles.decorator';
import { ProxyEntity } from './modules/proxy/entities/proxy.entity';

@Controller()
export class AppController {
  proxies: { proxy: ProxyEntity, duration: number }[] = []
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

  @Get('vps-speed')
  @Roles(Role.ADMIN)
  vpsSpeed() {
    return this.appService.getVpsSpeed()
  }

  @Public()
  @Post('/convert-uid')
  convertUid(@Body() body: { uid: string }) {
    return this.appService.convertUid(body.uid)
  }

  @Public()
  @Post('/proxy-low')
  proxyLow(@Body() body: { proxy: ProxyEntity, duration: number }) {
    if (this.proxies.length >= 50) {
      this.proxies.shift();
    }
    this.proxies.push(body);
  }
}
