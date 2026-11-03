import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { FACEBOOK_PORT, FacebookPort } from '../facebook.port';

@Injectable()
export class GetFacebookLinkInfoUseCase {
  constructor(
    @Inject(FACEBOOK_PORT)
    private readonly facebook: FacebookPort,
  ) {}

  async execute(url: string) {
    try {
      return await this.facebook.getLinkInfo(url);
    } catch (error) {
      throw new HttpException(
        this.getExternalErrorMessage(error),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  getExternalErrorMessage(error: unknown): string {
    if (
      error !== null &&
      typeof error === 'object' &&
      'response' in error &&
      error.response !== null &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data !== null &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data &&
      typeof error.response.data.message === 'string'
    ) {
      return error.response.data.message;
    }
    return error instanceof Error ? error.message : 'Facebook service failed';
  }
}
