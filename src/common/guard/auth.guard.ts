import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from 'src/common/guard/guard';

import { AuthService } from 'src/modules/auth/auth.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { jwtConstants } from '../../modules/auth/auth.module';
import { getSidFromRequest } from '../utils/auth';
import { UserService } from 'src/modules/user/user.service';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService, 
    private reflector: Reflector, 
    private redisService: RedisService,
    private authService: AuthService,
    private userService: UserService
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
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }
    const dataToken = await this.redisService.get(sid)

    if (!dataToken) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }

    let tokenParse: { accessToken?: string };
    try {
      tokenParse = JSON.parse(dataToken);
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }

    let payload: Partial<UserEntity>;
    try {
      const token = tokenParse.accessToken
      const { iat, exp, ...verifiedPayload } = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      payload = verifiedPayload;
    } catch (err) {
      payload = await this.authService.refreshToken(sid);
    }

    if (typeof payload.id !== 'number' || !Number.isInteger(payload.id) || payload.level == null) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }

    request['user'] = payload;
    await this.userService.updateLastActiveAt(payload.id);
    return true;
  }
}
