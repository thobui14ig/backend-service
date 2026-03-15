import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from 'src/common/guard/guard';

import { AuthService } from 'src/modules/auth/auth.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { jwtConstants } from '../../modules/auth/auth.module';
import { getSidFromRequest } from '../utils/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService, 
    private reflector: Reflector, 
    private redisService: RedisService,
    private authService: AuthService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }


    const request = context.switchToHttp().getRequest();
    const sid = getSidFromRequest(request)
    if (!sid) {
      throw new HttpException('Error', HttpStatus.PAYMENT_REQUIRED);
    }
    const dataToken = await this.redisService.get(sid)

    if (!dataToken) {
      throw new HttpException('Error', HttpStatus.PAYMENT_REQUIRED);
    }

    const tokenParse = JSON.parse(dataToken)

    try {
      const token = tokenParse.accessToken
      const { iat, exp, ...payload } = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      request['user'] = payload;
    } catch (err) {
      await this.authService.refreshToken(sid)
    }
    return true;
  }
}
