import { Controller, Get, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { getUser } from "src/common/utils/user";
import { OrderService } from "./order.service";
import { Role, Roles } from "src/common/decorators/roles.decorator";

@Controller('orders')
@Roles(Role.ADMIN)
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  create(@Req() req: Request, ) {
    const user = getUser(req);
    return this.orderService.create(user.id);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = getUser(req);
    return this.orderService.findAll(user.id);
  }
}