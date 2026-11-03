import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { getPlan } from 'src/common/utils/plan';
import {
  CreateTransactionUseCase,
} from '../../../transaction/application/use-cases/create-transaction.use-case';
import {
  CreateTransactionDto,
  TransactionType,
} from '../../../transaction/transaction.controller.i';
import { LEVEL } from '../../../user/entities/user.entity';
import { BidvNotiEntity } from '../../entities/bidv-noti.entity';
import { OrderPort, ORDER_PORT } from '../order.port';
import {
  BidvConfirmRefactor,
  BuyVipDto,
  CreateOrderDto,
} from '../../order.controller.i';

dayjs.extend(utc);

@Injectable()
export class CreateOrderUseCase {
  constructor(@Inject(ORDER_PORT) private readonly orders: OrderPort) {}

  execute(userId: number, input: CreateOrderDto) {
    return this.orders.create(userId, input);
  }
}

@Injectable()
export class GetOrdersUseCase {
  constructor(@Inject(ORDER_PORT) private readonly orders: OrderPort) {}

  execute(userId: number, level: LEVEL) {
    return this.orders.findAll(userId, level);
  }
}

@Injectable()
export class ConfirmOrderUseCase {
  constructor(
    @Inject(ORDER_PORT) private readonly orders: OrderPort,
    private readonly createTransaction: CreateTransactionUseCase,
  ) {}

  async execute(orderId: number) {
    return this.orders.transaction(async (transaction) => {
      const order = await transaction.findOrderForUpdate(orderId);
      if (!order) throw new NotFoundException('Order Not Found!');
      if (order.status === 'confirmed') {
        throw new BadRequestException('Order already confirmed');
      }

      const user = await transaction.findUserForUpdate(order.userId);
      if (!user) throw new NotFoundException('User Not Found!');

      await transaction.incrementBalance(user.id, order.amount);
      await transaction.updateOrderStatus(orderId, 'confirmed');

      const transactionInput: CreateTransactionDto = {
        type: TransactionType.INCOME,
        note: `Nạp tiền từ ${user.username}`,
        amount: order.amount,
      };
      await this.createTransaction.execute(transactionInput);

      return {
        message: 'Confirm order success',
        balance: user.balance,
      };
    });
  }
}

@Injectable()
export class BuyVipUseCase {
  constructor(@Inject(ORDER_PORT) private readonly orders: OrderPort) {}

  execute(input: BuyVipDto, userId: number) {
    const plan = getPlan(input.planId, userId);

    return this.orders.transaction(async (transaction) => {
      const user = await transaction.findUserForUpdate(userId);
      if (!user) throw new NotFoundException('User Not Found!');
      if (user.planId) {
        throw new BadRequestException('Liên hệ admin để mua vip mới!');
      }
      if (user.balance < plan.price) {
        throw new BadRequestException('Bạn không đủ tiền!');
      }

      await transaction.incrementBalance(userId, -Number(plan.price));
      await transaction.updateUser(userId, {
        planId: input.planId,
        totalLink: plan.maxLinks,
        isActive: true,
        expiredAt: dayjs().utc().add(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
      });
    });
  }
}

@Injectable()
export class ConfirmBidvUseCase {
  constructor(
    @Inject(ORDER_PORT) private readonly orders: OrderPort,
    private readonly createTransaction: CreateTransactionUseCase,
  ) {}

  execute(input: BidvConfirmRefactor) {
    const { code, userId, amount } = input;
    const isValid =
      typeof userId === 'number' &&
      Number.isFinite(userId) &&
      typeof amount === 'number' &&
      Number.isFinite(amount) &&
      typeof code === 'string';

    return this.orders.transaction(async (transaction) => {
      const notification: Partial<BidvNotiEntity> = {
        code: isValid ? code : `invalid-${randomUUID()}`,
        userId: Number.isFinite(userId) ? userId : 0,
        amount: Number.isFinite(amount) ? amount : 0,
        status: false,
      };

      if (!isValid) {
        return transaction.insertBidvNotification(notification);
      }

      const user = await transaction.findUserForUpdate(userId);
      if (!user) {
        return transaction.insertBidvNotification(notification);
      }

      notification.status = true;
      const result = await transaction.insertBidvNotification(notification);
      await transaction.incrementBalance(userId, amount);
      await transaction.saveOrder({
        userId,
        content: `Nạp tiền từ userId ${userId}`,
        amount,
        status: 'confirmed',
      });

      await this.createTransaction.execute({
        type: TransactionType.INCOME,
        note: `Nạp tiền từ ${user.username}`,
        amount,
      });
      return result;
    });
  }
}
