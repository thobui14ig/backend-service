import { Inject, Injectable } from '@nestjs/common';
import {
  COOKIE_EVENT_PORT,
  COOKIE_PORT,
  CookieEventPort,
  CookiePort,
} from '../cookie.port';
import { CreateCookieInput } from '../cookie.types';

@Injectable()
export class CreateCookiesUseCase {
  constructor(
    @Inject(COOKIE_PORT) private readonly cookies: CookiePort,
    @Inject(COOKIE_EVENT_PORT) private readonly events: CookieEventPort,
  ) {}

  async execute(input: CreateCookieInput, isStandardUser: boolean): Promise<void> {
    await this.cookies.create(input);

    if (isStandardUser) {
      input.cookies.forEach((cookie) => {
        this.events.emitTokenGenerationRequested({
          cookie,
          status: 'active',
          createdBy: input.createdBy,
          pageId: input.pageId,
        });
      });
    }
  }
}
