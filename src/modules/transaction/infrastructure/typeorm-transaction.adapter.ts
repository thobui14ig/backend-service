import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from '../transaction.controller.i';
import { TransactionPort } from '../application/transaction.port';
import { TransactionEntity } from '../entities/transaction.entity';

@Injectable()
export class TypeOrmTransactionAdapter implements TransactionPort {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
  ) {}

  create(input: CreateTransactionDto) {
    return this.repository.save(this.repository.create(input));
  }

  findAll() {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return Boolean(result.affected);
  }
}
