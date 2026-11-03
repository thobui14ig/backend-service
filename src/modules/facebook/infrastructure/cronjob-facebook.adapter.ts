import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  FacebookLinkInfo,
  FacebookPort,
} from '../application/facebook.port';

@Injectable()
export class CronjobFacebookAdapter implements FacebookPort {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getLinkInfo(url: string): Promise<FacebookLinkInfo> {
    const service = this.config.get<string>('CRONJOB_SERVICE');
    const response = await firstValueFrom(
      this.http.post(`http://${service}/facebook/get-info`, { url }),
    );
    return response.data as FacebookLinkInfo;
  }

  async getComments(info: FacebookLinkInfo) {
    const service = this.config.get<string>('COMMENT_SERVICE');
    const response = await firstValueFrom(
      this.http.post(`http://${service}/facebook/get-comments`, info),
    );
    return response.data;
  }
}
