import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderController } from './order.controller';
import { UserModule } from '../user/user.module';
import { TransactionModule } from '../transaction/transaction.module';
import { BidvNotiEntity } from './entities/bidv-noti.entity';
import { ORDER_PORT } from './application/order.port';
import { TypeOrmOrderAdapter } from './infrastructure/typeorm-order.adapter';
import {
  BuyVipUseCase,
  ConfirmBidvUseCase,
  ConfirmOrderUseCase,
  CreateOrderUseCase,
  GetOrdersUseCase,
} from './application/use-cases/order.use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, BidvNotiEntity]), UserModule, TransactionModule],
  controllers: [OrderController],
  providers: [
    TypeOrmOrderAdapter,
    { provide: ORDER_PORT, useExisting: TypeOrmOrderAdapter },
    CreateOrderUseCase,
    GetOrdersUseCase,
    ConfirmOrderUseCase,
    BuyVipUseCase,
    ConfirmBidvUseCase,
  ],
})
export class OrderModule { }
