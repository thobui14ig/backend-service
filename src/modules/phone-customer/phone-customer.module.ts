import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneCustomerEntity } from './entities/phone-customer.entity';
import { PhoneCustomerController } from './presentation/http/phone-customer.controller';
import { PHONE_CUSTOMER_PORT } from './application/phone-customer.port';
import {
  GetPhoneCustomerUseCase,
  ListPhoneCustomersUseCase,
  UpdatePhoneCustomerClickUseCase,
} from './application/use-cases/manage-phone-customer.use-cases';
import { TypeOrmPhoneCustomerAdapter } from './infrastructure/typeorm-phone-customer.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneCustomerEntity])],
  controllers: [PhoneCustomerController],
  providers: [
    GetPhoneCustomerUseCase,
    ListPhoneCustomersUseCase,
    UpdatePhoneCustomerClickUseCase,
    TypeOrmPhoneCustomerAdapter,
    { provide: PHONE_CUSTOMER_PORT, useExisting: TypeOrmPhoneCustomerAdapter },
  ],
})
export class PhoneCustomerModule { }
