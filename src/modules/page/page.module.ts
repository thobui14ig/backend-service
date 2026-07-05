import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageEntity } from './entities/page.entity';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { UserModule } from '../user/user.module';
import { HttpModule } from '@nestjs/axios';
import { LinkModule } from '../links/links.module';

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity]), UserModule, HttpModule, LinkModule],
  exports: [PageService],
  controllers: [PageController],
  providers: [PageService],
})
export class PageModule { }
