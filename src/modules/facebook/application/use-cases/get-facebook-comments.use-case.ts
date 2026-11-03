import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LinkType } from '../../../links/entities/links.entity';
import { FACEBOOK_PORT, FacebookPort } from '../facebook.port';
import { GetFacebookLinkInfoUseCase } from './get-facebook-link-info.use-case';

@Injectable()
export class GetFacebookCommentsUseCase {
  constructor(
    private readonly getLinkInfo: GetFacebookLinkInfoUseCase,
    @Inject(FACEBOOK_PORT)
    private readonly facebook: FacebookPort,
  ) {}

  async execute(url: string) {
    const info = await this.getLinkInfo.execute(url);
    if (info.type === LinkType.DIE || info.type === LinkType.UNDEFINED) {
      return info;
    }

    try {
      return await this.facebook.getComments(info);
    } catch (error) {
      throw new HttpException(
        this.getLinkInfo.getExternalErrorMessage(error),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
