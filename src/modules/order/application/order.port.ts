import { LEVEL, UserEntity } from '../../user/entities/user.entity';
import { OrderEntity } from '../entities/order.entity';
import { BidvNotiEntity } from '../entities/bidv-noti.entity';
import { CreateOrderDto } from '../order.controller.i';

export const ORDER_PORT = Symbol('ORDER_PORT');

export interface OrderTransactionPort {
  findOrderForUpdate(orderId: number): Promise<OrderEntity | null>;
  findUserForUpdate(userId: number): Promise<UserEntity | null>;
  incrementBalance(userId: number, amount: number): Promise<void>;
  updateUser(userId: number, patch: Partial<UserEntity>): Promise<void>;
  updateOrderStatus(orderId: number, status: 'confirmed'): Promise<void>;
  saveOrder(order: Partial<OrderEntity>): Promise<OrderEntity>;
  insertBidvNotification(notification: Partial<BidvNotiEntity>): Promise<unknown>;
}

export interface OrderPort {
  create(userId: number, order: CreateOrderDto): Promise<OrderEntity>;
  findAll(userId: number, level: LEVEL): Promise<OrderEntity[]>;
  transaction<T>(
    work: (transaction: OrderTransactionPort) => Promise<T>,
  ): Promise<T>;
}
