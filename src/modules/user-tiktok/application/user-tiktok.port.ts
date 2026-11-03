import { CreateUserTiktokDto } from '../dto/create-user-tiktok.dto';
import { UpdateUserTiktokDto } from '../dto/update-user-tiktok.dto';
import { UserTiktokEntity } from '../entities/page.entity';

export const USER_TIKTOK_PORT = Symbol('USER_TIKTOK_PORT');

export interface UserTiktokPort {
  getCapacity(userId: number): Promise<{ count: number; planId: number; ownerId: number }>;
  create(input: CreateUserTiktokDto, userId: number): Promise<UserTiktokEntity>;
  findAll(ownerId: number | null): Promise<unknown[]>;
  findAllPublic(userId: number): Promise<UserTiktokEntity[]>;
  findOne(id: number): Promise<UserTiktokEntity | null>;
  findOwned(id: number, userId: number): Promise<boolean>;
  update(id: number, input: UpdateUserTiktokDto): Promise<UserTiktokEntity>;
  delete(id: number): Promise<unknown>;
  deleteLinks(tiktokId: number, userId: number): Promise<unknown>;
}
