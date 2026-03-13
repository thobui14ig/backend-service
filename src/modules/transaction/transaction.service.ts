import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { CreateTransactionDto } from "./transaction.controller.i";

@Injectable()
export class TransactionService {
  constructor(
    private connection: DataSource,
  ) { }

  insert(dto: CreateTransactionDto) {
    return this.connection.query(`
        INSERT INTO transactions (type, amount, note)
        VALUES ('${dto.type}', ${dto.amount}, '${dto.note}');    
    `)
  }

  getAll() {
     return this.connection.query(`
        SELECT * 
        FROM transactions
        ORDER BY created_at DESC;
    `)   
  }
}