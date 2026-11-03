import { Module } from "@nestjs/common";
import { VpsController } from "./presentation/http/vps.controller";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VpsEntity } from "./entities/vps.entity";
import { VPS_PORT } from './application/vps.port';
import {
  CreateVpsUseCase,
  DeleteVpsUseCase,
  ListVpsUseCase,
  RestartVpsUseCase,
} from './application/use-cases/manage-vps.use-cases';
import { TypeOrmVpsAdapter } from './infrastructure/typeorm-vps.adapter';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([VpsEntity])],
    controllers: [VpsController],
    providers: [
      CreateVpsUseCase,
      DeleteVpsUseCase,
      ListVpsUseCase,
      RestartVpsUseCase,
      TypeOrmVpsAdapter,
      { provide: VPS_PORT, useExisting: TypeOrmVpsAdapter },
    ],
})
export class VpsModule { }
