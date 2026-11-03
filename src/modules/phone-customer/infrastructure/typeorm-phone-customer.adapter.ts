import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhoneCustomerPort } from '../application/phone-customer.port';
import { PhoneCustomerEntity } from '../entities/phone-customer.entity';
import { IUpdateClick } from '../phone-customer.controller.i';

@Injectable()
export class TypeOrmPhoneCustomerAdapter implements PhoneCustomerPort {
  constructor(
    @InjectRepository(PhoneCustomerEntity)
    private readonly repository: Repository<PhoneCustomerEntity>,
  ) {}

  findAll() {
    return this.repository.find({ order: { id: 'DESC' } });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  updateClick(input: IUpdateClick) {
    return this.repository.save(input);
  }
}
