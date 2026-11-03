import { Inject, Injectable } from '@nestjs/common';
import { COOKIE_PORT, CookiePort } from '../cookie.port';
import { UpdateCookieInput } from '../cookie.types';

@Injectable()
export class UpdateCookieUseCase {
  constructor(@Inject(COOKIE_PORT) private readonly cookies: CookiePort) {}

  execute(id: number, input: UpdateCookieInput) {
    return this.cookies.update(id, input);
  }
}
