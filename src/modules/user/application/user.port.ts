import { UserEntity } from '../entities/user.entity';

export const USER_CREATION_PORT = Symbol('USER_CREATION_PORT');

export interface UserCreationPort {
  usernameExists(username: string): Promise<boolean>;
  save(user: Partial<UserEntity>): Promise<UserEntity>;
  initializeConfiguration(userId: number): Promise<unknown>;
}
