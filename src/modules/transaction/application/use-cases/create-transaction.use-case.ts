import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_PORT, TransactionPort } from '../transaction.port';
import { CreateTransactionDto } from '../../transaction.controller.i';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_PORT) private readonly transactions: TransactionPort,
  ) {}

  execute(input: CreateTransactionDto) {
    return this.transactions.create(input);
  }
}
