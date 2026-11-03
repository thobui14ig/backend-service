import { CreateTransactionDto } from '../transaction.controller.i';
import { TransactionEntity } from '../entities/transaction.entity';

export const TRANSACTION_PORT = Symbol('TRANSACTION_PORT');

export interface TransactionPort {
  create(input: CreateTransactionDto): Promise<TransactionEntity>;
  findAll(): Promise<TransactionEntity[]>;
  delete(id: number): Promise<boolean>;
}
