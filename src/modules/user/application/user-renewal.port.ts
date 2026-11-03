import { UserEntity } from '../entities/user.entity';

export const USER_RENEWAL_PORT = Symbol('USER_RENEWAL_PORT');

export interface UserRenewalTransactionPort {
  findOwner(userId: number): Promise<UserEntity | null>;
  findSubUser(targetUserId: number, ownerUserId: number): Promise<UserEntity | null>;
  findRegularUser(userId: number): Promise<UserEntity | null>;
  debitAndUpdate(
    userId: number,
    amount: number,
    patch: Partial<UserEntity>,
  ): Promise<void>;
}

export interface UserRenewalPort {
  transaction<T>(
    work: (transaction: UserRenewalTransactionPort) => Promise<T>,
  ): Promise<T>;
}
