import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkModule } from '../links/links.module';
import { UserModule } from '../user/user.module';
import { UserTiktokEntity } from './entities/page.entity';
import { UserTiktokController } from './presentation/http/user-tiktok.controller';
import { USER_TIKTOK_PORT } from './application/user-tiktok.port';
import {
  CreateUserTiktokUseCase,
  DeleteUserTiktokUseCase,
  GetUserTiktokUseCase,
  ListPublicUserTiktokUseCase,
  ListUserTiktokUseCase,
  UpdateUserTiktokUseCase,
} from './application/use-cases/manage-user-tiktok.use-cases';
import { TypeOrmUserTiktokAdapter } from './infrastructure/typeorm-user-tiktok.adapter';
import { CheckVipInterceptor } from './interceptors/check-vip';

@Module({
  imports: [TypeOrmModule.forFeature([UserTiktokEntity]), UserModule, LinkModule],
  controllers: [UserTiktokController],
  providers: [
    CheckVipInterceptor,
    CreateUserTiktokUseCase,
    DeleteUserTiktokUseCase,
    GetUserTiktokUseCase,
    ListPublicUserTiktokUseCase,
    ListUserTiktokUseCase,
    UpdateUserTiktokUseCase,
    TypeOrmUserTiktokAdapter,
    { provide: USER_TIKTOK_PORT, useExisting: TypeOrmUserTiktokAdapter },
  ],
})
export class UserTiktokModule { }
