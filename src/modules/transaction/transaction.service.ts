import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTransactionDto } from "./transaction.controller.i";
import { TransactionEntity } from "./entities/transaction.entity";

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  insert(dto: CreateTransactionDto) {
    return this.transactionRepository.save(this.transactionRepository.create(dto));
  }

  getAll() {
    return this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number) {
    const result = await this.transactionRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Transaction not found');
    }
    return { message: 'Transaction deleted successfully' };
  }
}
