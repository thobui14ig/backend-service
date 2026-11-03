import { Inject, Injectable } from '@nestjs/common';
import { CookieEntity } from '../../../cookie/entities/cookie.entity';
import {
  FACEBOOK_COOKIE_PORT,
  FacebookCookiePort,
} from '../facebook-cookie.port';

@Injectable()
export class GenerateFacebookCookieInfoUseCase {
  constructor(
    @Inject(FACEBOOK_COOKIE_PORT)
    private readonly facebookCookies: FacebookCookiePort,
  ) {}

  async execute(cookie: CookieEntity) {
    const info = await this.facebookCookies.getCookieInfo(cookie.cookie);
    cookie.fbId = info?.facebookId;
    cookie.fbDtsg = info?.fbDtsg;
    cookie.jazoest = info?.jazoest;
    return this.facebookCookies.saveCookie(cookie);
  }
}
