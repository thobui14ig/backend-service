import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CookieEntity } from '../cookie/entities/cookie.entity';
import { FacebookController } from './facebook.controller';
import { FACEBOOK_PORT } from './application/facebook.port';
import { GetFacebookCommentsUseCase } from './application/use-cases/get-facebook-comments.use-case';
import { GetFacebookLinkInfoUseCase } from './application/use-cases/get-facebook-link-info.use-case';
import { CronjobFacebookAdapter } from './infrastructure/cronjob-facebook.adapter';
import { FACEBOOK_COOKIE_PORT } from './application/facebook-cookie.port';
import { GenerateFacebookCookieInfoUseCase } from './application/use-cases/generate-facebook-cookie-info.use-case';
import { TypeOrmFacebookCookieAdapter } from './infrastructure/typeorm-facebook-cookie.adapter';
import { FacebookCookieEventListener } from './infrastructure/facebook-cookie-event.listener';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([CookieEntity])],
  controllers: [FacebookController],
  providers: [
    GetFacebookCommentsUseCase,
    GetFacebookLinkInfoUseCase,
    CronjobFacebookAdapter,
    { provide: FACEBOOK_PORT, useExisting: CronjobFacebookAdapter },
    GenerateFacebookCookieInfoUseCase,
    TypeOrmFacebookCookieAdapter,
    { provide: FACEBOOK_COOKIE_PORT, useExisting: TypeOrmFacebookCookieAdapter },
    FacebookCookieEventListener,
  ],
})
export class FacebookModule { }
