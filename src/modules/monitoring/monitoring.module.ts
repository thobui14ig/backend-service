import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from '../comments/entities/comment.entity';
import { CookieEntity } from '../cookie/entities/cookie.entity';
import { FacebookModule } from '../facebook/facebook.module';
import { LinkEntity } from '../links/entities/links.entity';
import { LinkModule } from '../links/links.module';
import { ProxyEntity } from '../proxy/entities/proxy.entity';
import { TokenEntity } from '../token/entities/token.entity';
import { UserModule } from '../user/user.module';
import { VpsEntity } from '../vps/entities/vps.entity';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';

@Module({
  imports: [TypeOrmModule.forFeature([LinkEntity, CommentEntity, TokenEntity, CookieEntity, ProxyEntity, VpsEntity]), FacebookModule, HttpModule, UserModule, LinkModule],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule { }
