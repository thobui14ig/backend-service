import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { LEVEL, UserEntity } from '../../user/entities/user.entity';
import { BidvNotiEntity } from '../entities/bidv-noti.entity';
import { OrderEntity } from '../entities/order.entity';
import {
  OrderPort,
  OrderTransactionPort,
} from '../application/order.port';
import { CreateOrderDto } from '../order.controller.i';

@Injectable()
export class TypeOrmOrderAdapter implements OrderPort {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
    private readonly dataSource: DataSource,
  ) {}

  create(userId: number, input: CreateOrderDto) {
    return this.repository.save({
      userId,
      content: String(userId),
      amount: input.amount,
    });
  }

  findAll(userId: number, level: LEVEL) {
    if (level === LEVEL.ADMIN) {
      return this.repository.find({
        relations: { user: true },
        order: { id: 'DESC' },
        select: { user: { username: true } },
      });
    }

    return this.repository.find({
      where: { userId },
      order: { id: 'DESC' },
    });
  }

  transaction<T>(work: (transaction: OrderTransactionPort) => Promise<T>) {
    return this.dataSource.transaction((manager) => work(this.transactionAdapter(manager)));
  }

  private transactionAdapter(manager: EntityManager): OrderTransactionPort {
    return {
      findOrderForUpdate: (orderId) =>
        manager.findOne(OrderEntity, {
          where: { id: orderId },
          lock: { mode: 'pessimistic_write' },
        }),
      findUserForUpdate: (userId) =>
        manager.findOne(UserEntity, {
          where: { id: userId },
          lock: { mode: 'pessimistic_write' },
        }),
      incrementBalance: async (userId, amount) => {
        await manager.increment(UserEntity, { id: userId }, 'balance', amount);
      },
      updateUser: async (userId, patch) => {
        await manager.update(UserEntity, userId, patch);
      },
      updateOrderStatus: async (orderId, status) => {
        await manager.update(OrderEntity, orderId, { status });
      },
      saveOrder: (order) => manager.save(OrderEntity, order),
      insertBidvNotification: (notification) =>
        manager.insert(BidvNotiEntity, notification),
    };
  }
}
