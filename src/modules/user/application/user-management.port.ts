import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

export const USER_MANAGEMENT_PORT = Symbol('USER_MANAGEMENT_PORT');

export interface UserManagementPort {
  findByEmail(username: string): Promise<
    | (Partial<UserEntity> & { password: string })
    | null
  >;
  updateLastActiveAt(userId: number): Promise<unknown>;
  getAll(): Promise<Partial<UserEntity>[]>;
  getSubUsers(userId: number): Promise<Partial<UserEntity>[]>;
  getInfo(userId: number): Promise<Partial<UserEntity> | null>;
  findById(id: number): Promise<Partial<UserEntity> | null>;
  update(input: UpdateUserDto): Promise<UserEntity>;
  delete(id: number): Promise<unknown>;
  getForPasswordChange(userId: number): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
}
