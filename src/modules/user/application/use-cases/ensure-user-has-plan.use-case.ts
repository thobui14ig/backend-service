import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GetUserByIdUseCase } from './manage-users.use-cases';

@Injectable()
export class EnsureUserHasPlanUseCase {
  constructor(private readonly getUserById: GetUserByIdUseCase) {}

  async execute(userId: number) {
    const user = await this.getUserById.execute(userId);
    if (!user?.planId) {
      throw new HttpException(
        'Bạn chưa mua gói víp nào.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }
}
