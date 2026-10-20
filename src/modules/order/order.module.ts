import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { UserModule } from '../user/user.module';
import { TransactionModule } from '../transaction/transaction.module';
import { BidvNotiEntity } from './entities/bidv-noti.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, BidvNotiEntity]), UserModule, TransactionModule],
  exports: [OrderService],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
