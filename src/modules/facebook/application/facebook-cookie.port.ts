import { CookieEntity } from '../../cookie/entities/cookie.entity';

export const FACEBOOK_COOKIE_PORT = Symbol('FACEBOOK_COOKIE_PORT');

export interface FacebookCookieInfo {
  facebookId: string;
  fbDtsg: string;
  jazoest: string;
}

export interface FacebookCookiePort {
  getCookieInfo(cookie: string): Promise<FacebookCookieInfo | null>;
  saveCookie(cookie: CookieEntity): Promise<CookieEntity>;
}
