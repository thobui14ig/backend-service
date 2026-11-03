import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { GroupEntity } from '../entities/group.entity';

export const GROUP_PORT = Symbol('GROUP_PORT');

export interface GroupPort {
  create(input: CreateGroupDto, ownerId: number): Promise<GroupEntity>;
  findAll(ownerFilter: number | null): Promise<GroupEntity[]>;
  findOne(id: number): Promise<GroupEntity | null>;
  findOwned(id: number, ownerId: number): Promise<boolean>;
  update(id: number, input: UpdateGroupDto): Promise<GroupEntity>;
  delete(id: number): Promise<unknown>;
}
