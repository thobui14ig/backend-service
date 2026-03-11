import { Body, Controller, Get, Post } from "@nestjs/common";
import { Role, Roles } from "src/common/decorators/roles.decorator";
import { TransactionService } from "./transaction.service";
import { CreateTransactionDto } from "./transaction.controller.i";

@Controller('transactions')
@Roles(Role.ADMIN)
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @Post()
    create(@Body() dto: CreateTransactionDto) {
        return this.transactionService.insert(dto)
    }

    @Get()
    findAll() {
        return this.transactionService.getAll()
    }
}