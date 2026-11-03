import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { getUser } from "src/common/utils/user";
import { Role, Roles } from "src/common/decorators/roles.decorator";
import { BidvConfirm, BuyVipDto, ConfirmDto, CreateOrderDto } from "./order.controller.i";
import { Public } from "src/common/guard/guard";
import {
  BuyVipUseCase,
  ConfirmBidvUseCase,
  ConfirmOrderUseCase,
  CreateOrderUseCase,
  GetOrdersUseCase,
} from './application/use-cases/order.use-cases';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly getOrders: GetOrdersUseCase,
    private readonly confirmOrder: ConfirmOrderUseCase,
    private readonly buyVip: BuyVipUseCase,
    private readonly confirmBidv: ConfirmBidvUseCase,
  ) { }

  @Post()
  create(@Req() req: Request, @Body() body: CreateOrderDto) {
    const user = getUser(req);
    return this.createOrder.execute(user.id, body);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = getUser(req);
    return this.getOrders.execute(user.id, user.level);
  }

  @Post("/confirm")
  @Roles(Role.ADMIN)
  confirm(@Body() body: ConfirmDto) {
    return this.confirmOrder.execute(body.orderId);
  }

  @Post("/buy-vip")
  orderVip(@Req() req: Request, @Body() body: BuyVipDto) {
    const user = getUser(req);
    return this.buyVip.execute(body, user.id)
  }

  @Post("/bidv-confirm")
  @Public()
  bidvConfirm(@Req() req: Request, @Body() body: BidvConfirm) {
    const input = {
      ...body,
      userId: Number(body.content),
      amount: typeof body.amount === 'string'
        ? Number(body.amount.replace(/[+, \s]|VND/g, ''))
        : body.amount
    }

    return this.confirmBidv.execute(input)
  }
}