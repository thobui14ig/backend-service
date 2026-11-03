import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { RedisModule } from '../redis/redis.module';
import { AUTH_PORT } from './application/auth.port';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { SignInUseCase } from './application/use-cases/sign-in.use-case';
import { ExpiredSessionsCleanupJob } from './infrastructure/expired-sessions-cleanup.job';
import { JwtRedisAuthAdapter } from './infrastructure/jwt-redis-auth.adapter';

export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      // signOptions: { expiresIn: 24 * 60 * 60 },
    }),
    RedisModule
  ],
  controllers: [AuthController],
  providers: [
    SignInUseCase,
    RefreshSessionUseCase,
    JwtRedisAuthAdapter,
    ExpiredSessionsCleanupJob,
    { provide: AUTH_PORT, useExisting: JwtRedisAuthAdapter },
  ],
  exports: [RefreshSessionUseCase],
})
export class AuthModule { }
