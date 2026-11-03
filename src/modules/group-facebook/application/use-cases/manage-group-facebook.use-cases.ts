import { Inject, Injectable } from '@nestjs/common';
import { LEVEL } from '../../../user/entities/user.entity';
import {
  GROUP_FACEBOOK_PORT,
  GroupFacebookPort,
} from '../group-facebook.port';
import { CreateGroupFacebookDto } from '../../dto/create-group-facebook.dto';
import { UpdateGroupFacebookDto } from '../../dto/update-group-facebook.dto';

@Injectable()
export class CreateGroupFacebookUseCase {
  constructor(
    @Inject(GROUP_FACEBOOK_PORT)
    private readonly groups: GroupFacebookPort,
  ) {}

  execute(input: CreateGroupFacebookDto, userId: number) {
    return this.groups.create(input, userId);
  }
}

@Injectable()
export class ListGroupFacebookUseCase {
  constructor(
    @Inject(GROUP_FACEBOOK_PORT)
    private readonly groups: GroupFacebookPort,
  ) {}

  execute(userId: number, level: LEVEL) {
    return this.groups.findAll(level === LEVEL.ADMIN ? null : userId);
  }
}

@Injectable()
export class GetGroupFacebookUseCase {
  constructor(
    @Inject(GROUP_FACEBOOK_PORT)
    private readonly groups: GroupFacebookPort,
  ) {}

  execute(id: number) {
    return this.groups.findOne(id);
  }
}

@Injectable()
export class UpdateGroupFacebookUseCase {
  constructor(
    @Inject(GROUP_FACEBOOK_PORT)
    private readonly groups: GroupFacebookPort,
  ) {}

  execute(id: number, input: UpdateGroupFacebookDto) {
    return this.groups.update(id, input);
  }
}

@Injectable()
export class DeleteGroupFacebookUseCase {
  constructor(
    @Inject(GROUP_FACEBOOK_PORT)
    private readonly groups: GroupFacebookPort,
  ) {}

  execute(id: number) {
    return this.groups.remove(id);
  }
}
