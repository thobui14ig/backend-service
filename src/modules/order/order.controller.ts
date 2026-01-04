import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { getUser } from "src/common/utils/user";
import { OrderService } from "./order.service";
import { Role, Roles } from "src/common/decorators/roles.decorator";
import { ConfirmDto, CreateOrderDto } from "./order.controller.i";

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  create(@Req() req: Request, @Body() body: CreateOrderDto) {
    const user = getUser(req);
    return this.orderService.create(user.id, body);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = getUser(req);
    return this.orderService.findAll(user.id, user.level);
  }

  @Post("/confirm")
  @Roles(Role.ADMIN)
  confirm(@Body() body: ConfirmDto) {
    return this.orderService.confirm(body.orderId);
  }
}