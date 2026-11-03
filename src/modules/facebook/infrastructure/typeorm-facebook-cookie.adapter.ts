import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CookieEntity } from '../../cookie/entities/cookie.entity';
import {
  FacebookCookieInfo,
  FacebookCookiePort,
} from '../application/facebook-cookie.port';

@Injectable()
export class TypeOrmFacebookCookieAdapter implements FacebookCookiePort {
  constructor(
    private readonly http: HttpService,
    @InjectRepository(CookieEntity)
    private readonly cookies: Repository<CookieEntity>,
  ) {}

  async getCookieInfo(cookie: string): Promise<FacebookCookieInfo | null> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const headers = this.parseCookies(cookie);
        const response = await firstValueFrom(
          this.http.get('https://www.facebook.com', {
            headers: { Cookie: this.formatCookies(headers) },
          }),
        );
        const data = response.data as string;
        const fbDtsg = data.match(/DTSGInitialData",\[\],{"token":"(.*?)"}/)?.[1];
        const jazoest = data.match(/&jazoest=(.*?)"/)?.[1];
        const facebookId = data.match(/"USER_ID":"(.*?)"/)?.[1];

        if (fbDtsg && jazoest && facebookId) {
          return { fbDtsg, jazoest, facebookId };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ Attempt ${attempt} failed: ${message}`);
      }

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return null;
  }

  saveCookie(cookie: CookieEntity) {
    return this.cookies.save(cookie);
  }

  private formatCookies(cookies: Record<string, string>) {
    return Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }

  private parseCookies(cookie: string): Record<string, string> {
    return cookie
      .trim()
      .replace(/;$/, '')
      .split(';')
      .reduce<Record<string, string>>((result, item) => {
        const separator = item.indexOf('=');
        if (separator > 0) {
          result[item.slice(0, separator).trim()] = item
            .slice(separator + 1)
            .trim();
        }
        return result;
      }, {});
  }
}
