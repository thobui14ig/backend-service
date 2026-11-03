import { Module } from '@nestjs/common';
import { ProxyController } from './presentation/http/proxy.controller';
import { ProxyEntity } from './entities/proxy.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PROXY_PORT } from './application/proxy.port';
import {
  CreateProxiesUseCase,
  DeleteProxiesUseCase,
  DeleteProxyUseCase,
  GetProxyUseCase,
  ListProxiesUseCase,
  UpdateProxyUseCase,
} from './application/use-cases/manage-proxies.use-cases';
import { TypeOrmProxyAdapter } from './infrastructure/typeorm-proxy.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([ProxyEntity])],
  controllers: [ProxyController],
  providers: [
    CreateProxiesUseCase,
    DeleteProxiesUseCase,
    DeleteProxyUseCase,
    GetProxyUseCase,
    ListProxiesUseCase,
    UpdateProxyUseCase,
    TypeOrmProxyAdapter,
    { provide: PROXY_PORT, useExisting: TypeOrmProxyAdapter },
  ],
})
export class ProxyModule { }
