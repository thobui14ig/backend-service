import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TRANSACTION_PORT, TransactionPort } from '../transaction.port';

@Injectable()
export class DeleteTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_PORT) private readonly transactions: TransactionPort,
  ) {}

  async execute(id: number) {
    if (!(await this.transactions.delete(id))) {
      throw new NotFoundException('Transaction not found');
    }

    return { message: 'Transaction deleted successfully' };
  }
}
