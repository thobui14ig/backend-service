import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CookieEntity } from '../../cookie/entities/cookie.entity';
import { GenerateFacebookCookieInfoUseCase } from '../application/use-cases/generate-facebook-cookie-info.use-case';

@Injectable()
export class FacebookCookieEventListener {
  constructor(
    private readonly generateCookieInfo: GenerateFacebookCookieInfoUseCase,
  ) {}

  @OnEvent('gen-token-user')
  handleCookieCreated(cookie: CookieEntity) {
    return this.generateCookieInfo.execute(cookie);
  }
}
