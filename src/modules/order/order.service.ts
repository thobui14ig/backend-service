import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { getPlan } from "src/common/utils/plan";
import { DataSource, Repository } from "typeorm";
import { CreateTransactionDto, TransactionType } from "../transaction/transaction.controller.i";
import { TransactionService } from "../transaction/transaction.service";
import { LEVEL, UserEntity } from "../user/entities/user.entity";
import { OrderEntity } from "./entities/order.entity";
import { BuyVipDto, CreateOrderDto } from "./order.controller.i";
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private repo: Repository<OrderEntity>,
    private transactionService: TransactionService,
    private connection: DataSource
  ) {}

  create(userId: number, orderDto: CreateOrderDto) {
    const arg = {
        userId,
        content: userId,
        amount: orderDto.amount
    }
    return this.repo.save(arg)
  }

  findAll(userId: number, level: LEVEL) {
    if (level === LEVEL.ADMIN) {
      return this.repo.find({
        relations: {
          user: true
        },
        order: {
            id: "DESC"
        },
        select: {
          user: {
            username: true
          }
        }
      })      
    }

    return this.repo.find({
        where: {
            userId
        },
        order: {
            id: "DESC"
        }
    })
  }

  async confirm(orderId: number) {
    return this.connection.transaction(async (manager) => {
      const order = await manager.findOne(OrderEntity, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' }, 
      });

      if (!order) {
        throw new NotFoundException('Order Not Found!');
      }

      if (order.status === 'confirmed') {
        throw new BadRequestException('Order already confirmed');
      }

      const user = await manager.findOne(UserEntity, {
        where: { id: order.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new NotFoundException('User Not Found!');
      }

      await manager
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          balance: () => `"balance" + ${order.amount}`,
        })
        .where('id = :id', { id: user.id })
        .execute();

      await manager.update(OrderEntity, orderId, {
        status: 'confirmed',
      });
      const transaction: CreateTransactionDto = {
        type: TransactionType.INCOME,
        note: `Nạp tiền từ ${user.username}`,
        amount: order.amount
      }
      await this.transactionService.insert(transaction)

      return {
        message: 'Confirm order success',
        balance: user.balance,
      };
    });
  }

  buyVip(dto: BuyVipDto, userId: number) {
    const { planId } = dto
    const planInfo = getPlan(planId, userId)
  
    return this.connection.transaction(async (manager) => {
      const user = await manager.findOne(UserEntity, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new NotFoundException('User Not Found!');
      }
      
      if (user.planId) {
        throw new BadRequestException('Liên hệ admin để mua vip mới!'); 
      }  

      if (user.balance < planInfo.price) {
        throw new BadRequestException('Bạn không đủ tiền!'); 
      } 
      // await this.userService.update({ ...user, isActive: true } as any)

      await manager
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          balance: () => `"balance" - ${Number(planInfo.price)}`,
          planId,
          totalLink: planInfo.maxLinks,
          isActive: true,
          expiredAt: dayjs().utc().add(30, 'day').format('YYYY-MM-DD HH:mm:ss')
        })
        .where('id = :id', { id: user.id })
        .execute();  
    })
  }
}