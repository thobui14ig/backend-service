import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneCustomerEntity } from './entities/phone-customer.entity';
import { PhoneCustomerController } from './phone-customer.controller';
import { PhoneCustomerService } from './phone-customer.service';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneCustomerEntity])],
  exports: [PhoneCustomerService],
  controllers: [PhoneCustomerController],
  providers: [PhoneCustomerService],
})
export class PhoneCustomerModule { }
