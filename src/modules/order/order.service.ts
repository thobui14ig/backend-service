import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "./entities/order.entity";
import { Repository } from "typeorm";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private repo: Repository<OrderEntity>,
  ) {}

  create(userId: number) {
    const arg = {
        userId,
        content: userId
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
}