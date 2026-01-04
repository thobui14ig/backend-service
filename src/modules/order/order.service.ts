import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "./entities/order.entity";
import { Repository } from "typeorm";
import { CreateOrderDto } from "./order.controller.i";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private repo: Repository<OrderEntity>,
  ) {}

  create(userId: number, orderDto: CreateOrderDto) {
    const arg = {
        userId,
        content: userId,
        amount: orderDto.amount
    }
    return this.repo.save(arg)
  }

  findAll(userId: number) {
    return this.repo.find({
        where: {
            userId
        },
        order: {
            id: "DESC"
        }
    })
  }

  confirm(orderId: number) {
    return this.repo.save({ id: orderId, status: "confirmed" })
  }
}