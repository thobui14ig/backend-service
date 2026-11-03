import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { getUser } from './common/utils/user';
import { DashboardStats, RequestSong } from './app.controller.i';
import { Public } from './common/guard/guard';
import { Role, Roles } from './common/decorators/roles.decorator';
import { ProxyEntity } from './modules/proxy/entities/proxy.entity';
import { LEVEL } from './modules/user/entities/user.entity';
import {
  ConvertUidUseCase,
  GetDashboardStatsUseCase,
  GetExportLinkUseCase,
  GetFbNumberUseCase,
  GetUserSupportUseCase,
  GetVpsSpeedUseCase,
  InsertUserSupportUseCase,
  ProxyLowCacheUseCase,
} from './app/application/use-cases/app.use-cases';

@Controller()
export class AppController {
  constructor(
    private readonly getExportLinkUseCase: GetExportLinkUseCase,
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getUserSupportUseCase: GetUserSupportUseCase,
    private readonly insertUserSupportUseCase: InsertUserSupportUseCase,
    private readonly getFbNumberUseCase: GetFbNumberUseCase,
    private readonly getVpsSpeedUseCase: GetVpsSpeedUseCase,
    private readonly convertUidUseCase: ConvertUidUseCase,
    private readonly proxyLowCache: ProxyLowCacheUseCase,
  ) {}

  @Get('export-link/:linkId')
  getExportLink(@Param('linkId') linkId: number) {
    return this.getExportLinkUseCase.execute(linkId)
  }

  @Post('dashboard-stats')
  getDashboardStats(@Req() req: Request, @Body() body: { timezone: string }): Promise<DashboardStats> {
    const user = getUser(req);
    return this.getDashboardStatsUseCase.execute(
      { userId: user.id, isAdmin: user.level === LEVEL.ADMIN },
      body.timezone,
    );
  }

  @Public()
  @Get('/user-support')
  getUserSupport() {
    return this.getUserSupportUseCase.execute()
  }

  @Public()
  @Post('/insert-user-support')
  insertUserSupport(@Body() body: RequestSong) {
    return this.insertUserSupportUseCase.execute(body)
  }

  @Get('fb-number')
  @Roles(Role.ADMIN)
  getFbNumber() {
    return this.getFbNumberUseCase.execute()
  }

  @Get('vps-speed')
  @Roles(Role.ADMIN)
  vpsSpeed() {
    return this.getVpsSpeedUseCase.execute()
  }

  @Public()
  @Post('/convert-uids')
  convertUid(@Body() body: { uids: string[] }) {
    return this.convertUidUseCase.execute(body.uids)
  }

  @Public()
  @Post('/proxy-low')
  proxyLow(@Body() body: { proxy: ProxyEntity, duration: number }) {
    this.proxyLowCache.add(body);
  }

  @Public()
  @Get('get-proxy-low')
  getProxyLow() {
    return this.proxyLowCache.get()
  }
}
