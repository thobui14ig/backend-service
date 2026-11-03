import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TransactionController } from "./presentation/http/transaction.controller";
import { TransactionEntity } from "./entities/transaction.entity";
import { TRANSACTION_PORT } from './application/transaction.port';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { DeleteTransactionUseCase } from './application/use-cases/delete-transaction.use-case';
import { ListTransactionsUseCase } from './application/use-cases/list-transactions.use-case';
import { TypeOrmTransactionAdapter } from './infrastructure/typeorm-transaction.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [TransactionController],
  providers: [
    CreateTransactionUseCase,
    DeleteTransactionUseCase,
    ListTransactionsUseCase,
    TypeOrmTransactionAdapter,
    { provide: TRANSACTION_PORT, useExisting: TypeOrmTransactionAdapter },
  ],
  exports: [CreateTransactionUseCase]
})
export class TransactionModule { }