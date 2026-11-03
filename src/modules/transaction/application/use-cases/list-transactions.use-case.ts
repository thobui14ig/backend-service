import { Inject, Injectable } from '@nestjs/common';
import { TRANSACTION_PORT, TransactionPort } from '../transaction.port';

@Injectable()
export class ListTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_PORT) private readonly transactions: TransactionPort,
  ) {}

  execute() {
    return this.transactions.findAll();
  }
}
