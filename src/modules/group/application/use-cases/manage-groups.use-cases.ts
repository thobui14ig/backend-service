import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { LEVEL } from '../../../user/entities/user.entity';
import { GROUP_PORT, GroupPort } from '../group.port';
import { CreateGroupDto } from '../../dto/create-group.dto';
import { UpdateGroupDto } from '../../dto/update-group.dto';

@Injectable()
export class CreateGroupUseCase {
  constructor(@Inject(GROUP_PORT) private readonly groups: GroupPort) {}

  execute(input: CreateGroupDto, ownerId: number) {
    return this.groups.create(input, ownerId);
  }
}

@Injectable()
export class ListGroupsUseCase {
  constructor(@Inject(GROUP_PORT) private readonly groups: GroupPort) {}

  execute(
    user: { id?: number; level?: LEVEL },
    requestedUserId?: string,
  ) {
    let ownerFilter: number | null = null;
    if (requestedUserId !== undefined) {
      const parsed = Number(requestedUserId);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new BadRequestException('userId không hợp lệ');
      }
      if (user.level === LEVEL.ADMIN) ownerFilter = parsed;
    } else if (user.level !== LEVEL.ADMIN) {
      if (user.id === undefined) {
        throw new BadRequestException('userId không hợp lệ');
      }
      ownerFilter = user.id;
    }

    return this.groups.findAll(ownerFilter);
  }
}

@Injectable()
export class GetGroupUseCase {
  constructor(@Inject(GROUP_PORT) private readonly groups: GroupPort) {}

  execute(id: number) {
    return this.groups.findOne(id);
  }
}

@Injectable()
export class UpdateGroupUseCase {
  constructor(@Inject(GROUP_PORT) private readonly groups: GroupPort) {}

  async execute(
    id: number,
    input: UpdateGroupDto,
    userId: number,
    level: LEVEL,
  ) {
    await this.ensureCanManage(id, userId, level);
    return this.groups.update(id, input);
  }

  private async ensureCanManage(id: number, userId: number, level: LEVEL) {
    if (level !== LEVEL.ADMIN && !(await this.groups.findOwned(id, userId))) {
      throw new ForbiddenException('Bạn không có quyền');
    }
  }
}

@Injectable()
export class DeleteGroupUseCase {
  constructor(@Inject(GROUP_PORT) private readonly groups: GroupPort) {}

  async execute(id: number, userId: number, level: LEVEL) {
    if (level !== LEVEL.ADMIN && !(await this.groups.findOwned(id, userId))) {
      throw new ForbiddenException('Bạn không có quyền');
    }
    return this.groups.delete(id);
  }
}
