import { CreateGroupFacebookDto } from '../dto/create-group-facebook.dto';
import { UpdateGroupFacebookDto } from '../dto/update-group-facebook.dto';
import { GroupFacebookEntity } from '../entities/group-facebook.entity';

export const GROUP_FACEBOOK_PORT = Symbol('GROUP_FACEBOOK_PORT');

export interface GroupFacebookPort {
  create(input: CreateGroupFacebookDto, userId: number): Promise<GroupFacebookEntity>;
  findAll(userId: number | null): Promise<GroupFacebookEntity[]>;
  findOne(id: number): Promise<GroupFacebookEntity | null>;
  update(id: number, input: UpdateGroupFacebookDto): Promise<GroupFacebookEntity>;
  remove(id: number): Promise<unknown>;
}
