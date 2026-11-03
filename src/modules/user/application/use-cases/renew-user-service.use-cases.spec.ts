import { BadRequestException } from '@nestjs/common';
import { UserEntity } from '../../entities/user.entity';
import {
  UserRenewalPort,
  UserRenewalTransactionPort,
} from '../user-renewal.port';
import { RenewResellerUserServiceUseCase } from './renew-user-service.use-cases';

describe('RenewResellerUserServiceUseCase', () => {
  const transaction: UserRenewalTransactionPort = {
    findOwner: jest.fn(),
    findSubUser: jest.fn(),
    findRegularUser: jest.fn(),
    debitAndUpdate: jest.fn(),
  };
  const renewals: UserRenewalPort = {
    transaction: jest.fn((work) => work(transaction)),
  };
  const useCase = new RenewResellerUserServiceUseCase(renewals);

  beforeEach(() => jest.clearAllMocks());

  it('charges the owner and renews the owned sub-user', async () => {
    (transaction.findOwner as jest.Mock).mockResolvedValue({
      id: 2,
      balance: 200000,
    } as UserEntity);
    (transaction.findSubUser as jest.Mock).mockResolvedValue({
      id: 9,
      expiredAt: null,
    } as UserEntity);

    await expect(useCase.execute(9, 2)).resolves.toMatchObject({
      message: 'Gia hạn dịch vụ thành công.',
      balance: 100000,
    });

    expect(transaction.debitAndUpdate).toHaveBeenNthCalledWith(1, 2, 100000, {});
    expect(transaction.debitAndUpdate).toHaveBeenNthCalledWith(
      2,
      9,
      0,
      expect.objectContaining({
        planId: 1,
        isActive: true,
        isGetPhone: true,
        expiredAt: expect.any(String),
      }),
    );
  });

  it('does not debit an owner when the requested target is not theirs', async () => {
    (transaction.findOwner as jest.Mock).mockResolvedValue({
      id: 2,
      balance: 200000,
    });
    (transaction.findSubUser as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(9, 2)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(transaction.debitAndUpdate).not.toHaveBeenCalled();
  });
});
