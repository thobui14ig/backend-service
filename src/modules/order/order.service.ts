import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "./entities/order.entity";
import { DataSource, Repository } from "typeorm";
import { CreateOrderDto } from "./order.controller.i";
import { LEVEL, UserEntity } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private repo: Repository<OrderEntity>,
    private userService: UserService,
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
          order: {
              id: "DESC"
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
      return {
        message: 'Confirm order success',
        balance: user.balance,
      };
    });
  }

}