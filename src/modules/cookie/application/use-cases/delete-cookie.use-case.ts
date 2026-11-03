import { Inject, Injectable } from '@nestjs/common';
import { COOKIE_PORT, CookiePort } from '../cookie.port';

@Injectable()
export class DeleteCookieUseCase {
  constructor(@Inject(COOKIE_PORT) private readonly cookies: CookiePort) {}

  execute(id: number) {
    return this.cookies.remove(id);
  }
}
