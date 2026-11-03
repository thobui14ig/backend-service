import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageEntity } from './entities/page.entity';
import { PageController } from './presentation/http/page.controller';
import { UserModule } from '../user/user.module';
import { HttpModule } from '@nestjs/axios';
import { LinkModule } from '../links/links.module';
import { PAGE_PORT } from './application/page.port';
import {
  CreatePageUseCase,
  DeletePageUseCase,
  GetPageUseCase,
  ListPagesUseCase,
  UpdatePageUseCase,
} from './application/use-cases/manage-pages.use-cases';
import { TypeOrmPageAdapter } from './infrastructure/typeorm-page.adapter';
import { CheckVipInterceptor } from './interceptors/check-vip';

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity]), UserModule, HttpModule, LinkModule],
  controllers: [PageController],
  providers: [
    CheckVipInterceptor,
    CreatePageUseCase,
    DeletePageUseCase,
    GetPageUseCase,
    ListPagesUseCase,
    UpdatePageUseCase,
    TypeOrmPageAdapter,
    { provide: PAGE_PORT, useExisting: TypeOrmPageAdapter },
  ],
})
export class PageModule { }
