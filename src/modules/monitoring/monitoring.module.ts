import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkEntity } from '../links/entities/links.entity';
import { LinkModule } from '../links/links.module';
import { UserModule } from '../user/user.module';
import { VpsEntity } from '../vps/entities/vps.entity';
import { MonitoringController } from './presentation/http/monitoring.controller';
import { MONITORING_PORT } from './application/monitoring.port';
import { CheckVpsStatusUseCase } from './application/use-cases/check-vps-status.use-case';
import { UpdateLinkProcessUseCase } from './application/use-cases/update-link-process.use-case';
import { TypeOrmMonitoringAdapter } from './infrastructure/typeorm-monitoring.adapter';
import { CheckLimitLinkUserWhenEditLinkInterceptor } from './interceptors/handle-check-limit-link-user-when-edit-link.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([LinkEntity, VpsEntity]), HttpModule, UserModule, LinkModule],
  controllers: [MonitoringController],
  providers: [
    CheckLimitLinkUserWhenEditLinkInterceptor,
    CheckVpsStatusUseCase,
    UpdateLinkProcessUseCase,
    TypeOrmMonitoringAdapter,
    { provide: MONITORING_PORT, useExisting: TypeOrmMonitoringAdapter },
  ],
})
export class MonitoringModule { }
