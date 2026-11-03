import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Role, Roles } from '../../../../common/decorators/roles.decorator';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { DeleteTransactionUseCase } from '../../application/use-cases/delete-transaction.use-case';
import { ListTransactionsUseCase } from '../../application/use-cases/list-transactions.use-case';
import { CreateTransactionDto } from '../../transaction.controller.i';

@Controller('transactions')
@Roles(Role.ADMIN)
export class TransactionController {
    constructor(
      private readonly createTransaction: CreateTransactionUseCase,
      private readonly listTransactions: ListTransactionsUseCase,
      private readonly deleteTransaction: DeleteTransactionUseCase,
    ) {}

    @Post()
    create(@Body() dto: CreateTransactionDto) {
        return this.createTransaction.execute(dto)
    }

    @Get()
    findAll() {
        return this.listTransactions.execute()
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.deleteTransaction.execute(id)
    }
}