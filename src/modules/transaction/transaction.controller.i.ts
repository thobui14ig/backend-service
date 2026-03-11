export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense'
}

export interface CreateTransactionDto{
    type: TransactionType
    amount: number
    note: string
}