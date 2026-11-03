import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../../../user/entities/user.entity';
import { AUTH_PORT, AuthPort } from '../auth.port';

const INVALID_SESSION_MESSAGE =
  'Phiên đăng nhập không hợp lệ hoặc đã hết hạn';

@Injectable()
export class RefreshSessionUseCase {
  constructor(@Inject(AUTH_PORT) private readonly auth: AuthPort) {}

  async execute(sessionId: string): Promise<Partial<UserEntity>> {
    const data = await this.auth.getSession(sessionId);
    if (!data) throw new UnauthorizedException(INVALID_SESSION_MESSAGE);

    let refreshToken: string;
    try {
      const session: unknown = JSON.parse(data);
      if (
        session === null ||
        typeof session !== 'object' ||
        !('refreshToken' in session) ||
        typeof session.refreshToken !== 'string'
      ) {
        throw new Error('Invalid session payload');
      }
      refreshToken = session.refreshToken;
    } catch {
      throw new UnauthorizedException(INVALID_SESSION_MESSAGE);
    }

    let decoded: Partial<UserEntity> & { iat?: number; exp?: number };
    try {
      decoded = await this.auth.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException(INVALID_SESSION_MESSAGE);
    }

    const { iat, exp, ...payload } = decoded;
    const token = await this.auth.createToken(payload);
    await this.auth.deleteSession(sessionId);
    await this.auth.saveSession(sessionId, token);
    return payload;
  }
}
