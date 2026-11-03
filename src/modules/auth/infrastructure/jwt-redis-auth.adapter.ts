import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../../user/entities/user.entity';
import { RedisService } from '../../redis/redis.service';
import { FindUserByEmailUseCase } from '../../user/application/use-cases/manage-users.use-cases';
import { AuthPort, AuthSession } from '../application/auth.port';

@Injectable()
export class JwtRedisAuthAdapter implements AuthPort {
  constructor(
    private readonly findUserByEmail: FindUserByEmailUseCase,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
  ) {}

  findUserForLogin(username: string) {
    return this.findUserByEmail.execute(username);
  }

  async createToken(
    payload: Omit<Partial<UserEntity>, 'password'>,
  ): Promise<AuthSession> {
    return {
      accessToken: await this.jwt.signAsync(payload, { expiresIn: '1d' }),
      refreshToken: await this.jwt.signAsync(payload, { expiresIn: '7d' }),
    };
  }

  verifyRefreshToken(token: string) {
    return this.jwt.verifyAsync<
      Partial<UserEntity> & { iat?: number; exp?: number }
    >(token);
  }

  createSessionId(): string {
    return uuidv4();
  }

  async saveSession(id: string, value: AuthSession): Promise<void> {
    await this.redis.setJson(id, value);
  }

  getSession(id: string): Promise<string | null> {
    return this.redis.get(id);
  }

  deleteSession(id: string) {
    return this.redis.delete(id);
  }

  verifyTokenIgnoringExpiration(token: string): unknown {
    return this.jwt.verify(token, {
      ignoreExpiration: true,
    });
  }

  scanSessionIds() {
    return this.redis.scanKeys();
  }

  deleteSessionIfUnchanged(id: string, value: string) {
    return this.redis.deleteIfValueMatches(id, value);
  }
}
