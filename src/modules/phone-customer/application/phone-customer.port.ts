import { PhoneCustomerEntity } from '../entities/phone-customer.entity';
import { IUpdateClick } from '../phone-customer.controller.i';

export const PHONE_CUSTOMER_PORT = Symbol('PHONE_CUSTOMER_PORT');

export interface PhoneCustomerPort {
  findAll(): Promise<PhoneCustomerEntity[]>;
  findOne(id: number): Promise<PhoneCustomerEntity | null>;
  updateClick(input: IUpdateClick): Promise<PhoneCustomerEntity>;
}
