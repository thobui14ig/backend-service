import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export const getUser = (req: Request): UserEntity => {
  const user = req['user'] as UserEntity | undefined;
  if (!user || user.id == null || user.level == null) {
    throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
  }
  return user;
};
