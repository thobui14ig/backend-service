import { Inject, Injectable } from '@nestjs/common';
import { COOKIE_PORT, CookiePort } from '../cookie.port';

@Injectable()
export class ListCookiesUseCase {
  constructor(@Inject(COOKIE_PORT) private readonly cookies: CookiePort) {}

  execute(isStandardUser: boolean, userId: number) {
    return isStandardUser
      ? this.cookies.findAllForUser(userId)
      : this.cookies.findAll();
  }
}
