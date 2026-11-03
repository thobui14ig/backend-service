import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { getPlan } from '../../../../common/utils/plan';
import { LEVEL } from '../../../user/entities/user.entity';
import { USER_TIKTOK_PORT, UserTiktokPort } from '../user-tiktok.port';
import { CreateUserTiktokDto } from '../../dto/create-user-tiktok.dto';
import { UpdateUserTiktokDto } from '../../dto/update-user-tiktok.dto';

@Injectable()
export class CreateUserTiktokUseCase {
  constructor(
    @Inject(USER_TIKTOK_PORT)
    private readonly tiktokUsers: UserTiktokPort,
  ) {}

  async execute(input: CreateUserTiktokDto, userId: number) {
    const capacity = await this.tiktokUsers.getCapacity(userId);
    const plan = getPlan(capacity.planId, capacity.ownerId);
    if (capacity.count >= plan.maxTiktok) {
      throw new HttpException(
        `Vip${plan.id} chỉ được thêm tối đa ${plan.maxTiktok} tiktok`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.tiktokUsers.create(input, userId);
  }
}

@Injectable()
export class ListUserTiktokUseCase {
  constructor(
    @Inject(USER_TIKTOK_PORT)
    private readonly tiktokUsers: UserTiktokPort,
  ) {}

  execute(user: { id?: number; level?: LEVEL }) {
    return this.tiktokUsers.findAll(
      user.level === LEVEL.ADMIN ? null : (user.id ?? null),
    );
  }
}

@Injectable()
export class ListPublicUserTiktokUseCase {
  constructor(
    @Inject(USER_TIKTOK_PORT)
    private readonly tiktokUsers: UserTiktokPort,
  ) {}

  execute(id: string) {
    return this.tiktokUsers.findAllPublic(Number(id));
  }
}

@Injectable()
export class GetUserTiktokUseCase {
  constructor(
    @Inject(USER_TIKTOK_PORT)
    private readonly tiktokUsers: UserTiktokPort,
  ) {}

  execute(id: number) {
    return this.tiktokUsers.findOne(id);
  }
}

@Injectable()
export class UpdateUserTiktokUseCase {
  constructor(
    @Inject(USER_TIKTOK_PORT)
    private readonly tiktokUsers: UserTiktokPort,
  ) {}

  async execute(id: number, input: UpdateUserTiktokDto, userId: number) {
    if (!(await this.tiktokUsers.findOwned(id, userId))) {
      throw new ForbiddenException('Bạn không có quyền');
    }
    return this.tiktokUsers.update(id, input);
  }
}

@Injectable()
export class DeleteUserTiktokUseCase {
  constructor(
    @Inject(USER_TIKTOK_PORT)
    private readonly tiktokUsers: UserTiktokPort,
  ) {}

  async execute(id: number, user: { id?: number; level?: LEVEL }) {
    const tiktokUser = await this.tiktokUsers.findOne(id);
    if (
      !tiktokUser ||
      (user.level !== LEVEL.ADMIN && tiktokUser.userId !== user.id)
    ) {
      throw new ForbiddenException('Bạn không có quyền');
    }

    await this.tiktokUsers.deleteLinks(
      tiktokUser.id,
      user.id ?? tiktokUser.userId,
    );
    return this.tiktokUsers.delete(id);
  }
}
