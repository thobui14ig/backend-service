import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhoneCustomerEntity } from './entities/phone-customer.entity';
import { IUpdateClick } from './phone-customer.controller.i';

@Injectable()
export class PhoneCustomerService {
  constructor(
    @InjectRepository(PhoneCustomerEntity)
    private repo: Repository<PhoneCustomerEntity>,
  ) { }

  findAll() {
    return this.repo.find({
      order: {
        id: "DESC"
      }
    })
  }

  findOne(id: number) {
    return this.repo.findOne({
      where: {
        id,
      },
    });
  }

  updateClick(params: IUpdateClick) {
    return this.repo.save(params)
  }
}
