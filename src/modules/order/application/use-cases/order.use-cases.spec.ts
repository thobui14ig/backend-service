import { BadRequestException } from '@nestjs/common';
import { TransactionPort } from '../../../transaction/application/transaction.port';
import { CreateTransactionUseCase } from '../../../transaction/application/use-cases/create-transaction.use-case';
import { UserEntity } from '../../../user/entities/user.entity';
import { OrderEntity } from '../../entities/order.entity';
import {
  OrderPort,
  OrderTransactionPort,
} from '../order.port';
import { ConfirmOrderUseCase } from './order.use-cases';

describe('ConfirmOrderUseCase', () => {
  const transaction: OrderTransactionPort = {
    findOrderForUpdate: jest.fn(),
    findUserForUpdate: jest.fn(),
    incrementBalance: jest.fn(),
    updateUser: jest.fn(),
    updateOrderStatus: jest.fn(),
    saveOrder: jest.fn(),
    insertBidvNotification: jest.fn(),
  };
  const orders: OrderPort = {
    create: jest.fn(),
    findAll: jest.fn(),
    transaction: jest.fn((work) => work(transaction)),
  };
  const transactions: TransactionPort = {
    create: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };
  const useCase = new ConfirmOrderUseCase(
    orders,
    new CreateTransactionUseCase(transactions),
  );

  beforeEach(() => jest.clearAllMocks());

  it('credits the user, confirms the order, and records the income', async () => {
    const order = { id: 3, userId: 7, amount: 500, status: 'pending' };
    const user = { id: 7, username: 'customer', balance: 100 } as UserEntity;
    (transaction.findOrderForUpdate as jest.Mock).mockResolvedValue(
      order as OrderEntity,
    );
    (transaction.findUserForUpdate as jest.Mock).mockResolvedValue(user);

    await expect(useCase.execute(3)).resolves.toEqual({
      message: 'Confirm order success',
      balance: 100,
    });

    expect(transaction.incrementBalance).toHaveBeenCalledWith(7, 500);
    expect(transaction.updateOrderStatus).toHaveBeenCalledWith(3, 'confirmed');
    expect(transactions.create).toHaveBeenCalledWith({
      type: 'income',
      note: 'Nạp tiền từ customer',
      amount: 500,
    });
  });

  it('rejects a confirmed order without crediting its user', async () => {
    (transaction.findOrderForUpdate as jest.Mock).mockResolvedValue({
      id: 3,
      status: 'confirmed',
    });

    await expect(useCase.execute(3)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(transaction.incrementBalance).not.toHaveBeenCalled();
  });
});
