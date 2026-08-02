import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkModule } from '../links/links.module';
import { UserModule } from '../user/user.module';
import { UserTiktokEntity } from './entities/page.entity';
import { UserTiktokController } from './user-tiktok.controller';
import { UserTiktokService } from './user-tiktok.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserTiktokEntity]), UserModule, HttpModule, LinkModule],
  exports: [UserTiktokService],
  controllers: [UserTiktokController],
  providers: [UserTiktokService],
})
export class UserTiktokModule { }
