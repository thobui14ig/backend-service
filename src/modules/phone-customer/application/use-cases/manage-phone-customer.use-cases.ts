import { Inject, Injectable } from '@nestjs/common';
import {
  PHONE_CUSTOMER_PORT,
  PhoneCustomerPort,
} from '../phone-customer.port';
import { IUpdateClick } from '../../phone-customer.controller.i';

@Injectable()
export class ListPhoneCustomersUseCase {
  constructor(
    @Inject(PHONE_CUSTOMER_PORT)
    private readonly customers: PhoneCustomerPort,
  ) {}

  execute() {
    return this.customers.findAll();
  }
}

@Injectable()
export class GetPhoneCustomerUseCase {
  constructor(
    @Inject(PHONE_CUSTOMER_PORT)
    private readonly customers: PhoneCustomerPort,
  ) {}

  execute(id: number) {
    return this.customers.findOne(id);
  }
}

@Injectable()
export class UpdatePhoneCustomerClickUseCase {
  constructor(
    @Inject(PHONE_CUSTOMER_PORT)
    private readonly customers: PhoneCustomerPort,
  ) {}

  execute(input: IUpdateClick) {
    return this.customers.updateClick(input);
  }
}
