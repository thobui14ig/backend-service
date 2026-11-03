import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { LEVEL, UserEntity } from '../entities/user.entity';
import {
  UserRenewalPort,
  UserRenewalTransactionPort,
} from '../application/user-renewal.port';

@Injectable()
export class TypeOrmUserRenewalAdapter implements UserRenewalPort {
  constructor(private readonly dataSource: DataSource) {}

  transaction<T>(
    work: (transaction: UserRenewalTransactionPort) => Promise<T>,
  ) {
    return this.dataSource.transaction((manager) => work(this.createUnitOfWork(manager)));
  }

  private createUnitOfWork(manager: EntityManager): UserRenewalTransactionPort {
    const findUserForUpdate = (id: number) =>
      manager.findOne(UserEntity, {
        where: { id, isDelete: false },
        lock: { mode: 'pessimistic_write' },
      });

    return {
      findOwner: findUserForUpdate,
      findSubUser: (targetUserId, ownerUserId) =>
        manager.findOne(UserEntity, {
          where: {
            id: targetUserId,
            parentId: ownerUserId,
            isDelete: false,
          },
          lock: { mode: 'pessimistic_write' },
        }),
      findRegularUser: (userId) =>
        manager.findOne(UserEntity, {
          where: { id: userId, isDelete: false, level: LEVEL.USER },
          lock: { mode: 'pessimistic_write' },
        }),
      debitAndUpdate: async (userId, amount, patch) => {
        if (amount !== 0) {
          await manager.increment(UserEntity, { id: userId }, 'balance', -amount);
        }
        if (Object.keys(patch).length) {
          await manager.update(UserEntity, userId, patch);
        }
      },
    };
  }
}
