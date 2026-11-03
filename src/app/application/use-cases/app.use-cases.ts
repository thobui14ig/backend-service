import { Inject, Injectable } from '@nestjs/common';
import { APP_PORT, AppPort, DashboardUserScope } from '../app.port';
import { DashboardStats, RequestSong } from '../../../app.controller.i';
import { ProxyEntity } from '../../../modules/proxy/entities/proxy.entity';

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(@Inject(APP_PORT) private readonly app: AppPort) {}

  execute(user: DashboardUserScope, timezone: string): Promise<DashboardStats> {
    return this.app.getDashboardStats(user, timezone);
  }
}

@Injectable()
export class GetUserSupportUseCase {
  constructor(@Inject(APP_PORT) private readonly app: AppPort) {}

  execute() {
    return this.app.getUserSupport();
  }
}

@Injectable()
export class InsertUserSupportUseCase {
  constructor(@Inject(APP_PORT) private readonly app: AppPort) {}

  execute(input: RequestSong) {
    return this.app.insertUserSupport(input);
  }
}

@Injectable()
export class GetExportLinkUseCase {
  constructor(@Inject(APP_PORT) private readonly app: AppPort) {}

  execute(linkId: number) {
    return this.app.getExportLink(linkId);
  }
}

@Injectable()
export class GetFbNumberUseCase {
  constructor(@Inject(APP_PORT) private readonly app: AppPort) {}

  execute() {
    return this.app.getFbNumber();
  }
}

@Injectable()
export class GetVpsSpeedUseCase {
  constructor(@Inject(APP_PORT) private readonly app: AppPort) {}

  execute() {
    return this.app.getVpsSpeed();
  }
}

@Injectable()
export class ConvertUidUseCase {
  constructor(@Inject(APP_PORT) private readonly app: AppPort) {}

  execute(uids: string[]) {
    return this.app.convertUid(uids);
  }
}

@Injectable()
export class ProxyLowCacheUseCase {
  private readonly proxies: { proxy: ProxyEntity; duration: number }[] = [];

  add(input: { proxy: ProxyEntity; duration: number }) {
    if (this.proxies.length >= 50) this.proxies.shift();
    this.proxies.push(input);
  }

  get() {
    return this.proxies;
  }
}
