import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { getPlan } from 'src/common/utils/plan';
import {
  USER_RENEWAL_PORT,
  UserRenewalPort,
} from '../user-renewal.port';

dayjs.extend(utc);

@Injectable()
export class RenewResellerUserServiceUseCase {
  constructor(
    @Inject(USER_RENEWAL_PORT) private readonly renewals: UserRenewalPort,
  ) {}

  execute(targetUserId: number, ownerUserId: number) {
    if (!Number.isInteger(targetUserId)) {
      throw new BadRequestException('userId không hợp lệ.');
    }

    const renewalPrice = 100000;
    return this.renewals.transaction(async (transaction) => {
      const owner = await transaction.findOwner(ownerUserId);
      if (!owner) throw new BadRequestException('Tài khoản không tồn tại.');

      const target = await transaction.findSubUser(targetUserId, ownerUserId);
      if (!target) {
        throw new BadRequestException('User không phải cấp dưới của bạn.');
      }
      if (owner.balance < renewalPrice) {
        throw new BadRequestException('Bạn không đủ tiền!');
      }

      const renewedExpiredAt = this.extendOneMonth(target.expiredAt);
      await transaction.debitAndUpdate(ownerUserId, renewalPrice, {});
      await transaction.debitAndUpdate(targetUserId, 0, {
        planId: 1,
        isActive: true,
        isGetPhone: true,
        expiredAt: renewedExpiredAt,
      });

      return {
        message: 'Gia hạn dịch vụ thành công.',
        balance: owner.balance - renewalPrice,
        expiredAt: renewedExpiredAt,
      };
    });
  }

  private extendOneMonth(expiredAt: Date | string | null) {
    const now = dayjs().utc();
    const expiration = expiredAt ? dayjs.utc(expiredAt) : null;
    const base =
      expiration?.isValid() && expiration.isAfter(now) ? expiration : now;
    return base.add(1, 'month').format('YYYY-MM-DD HH:mm:ss');
  }
}

@Injectable()
export class RenewUserServiceUseCase {
  constructor(
    @Inject(USER_RENEWAL_PORT) private readonly renewals: UserRenewalPort,
  ) {}

  execute(userId: number) {
    if (!Number.isInteger(userId)) {
      throw new BadRequestException('userId không hợp lệ.');
    }

    return this.renewals.transaction(async (transaction) => {
      const user = await transaction.findRegularUser(userId);
      if (!user) throw new BadRequestException('Tài khoản không tồn tại.');
      if (!user.isActive || !user.planId) {
        throw new BadRequestException('Bạn chưa mua gói víp.');
      }

      const plan = getPlan(user.planId, user.id);
      if (
        typeof plan.price !== 'number' ||
        !Number.isFinite(plan.price) ||
        plan.price <= 0
      ) {
        throw new BadRequestException('Gói VIP hiện tại không thể gia hạn.');
      }

      const amountDue = plan.price - (user.discountAmount ?? 0);
      if (!Number.isFinite(amountDue) || amountDue < 0) {
        throw new BadRequestException('Mức giảm giá không hợp lệ.');
      }
      if (user.balance < amountDue) {
        throw new BadRequestException('Bạn không đủ tiền!');
      }

      const now = dayjs().utc();
      const expiration = user.expiredAt ? dayjs.utc(user.expiredAt) : null;
      const base =
        expiration?.isValid() && expiration.isAfter(now) ? expiration : now;
      const renewedExpiredAt = base
        .add(1, 'month')
        .format('YYYY-MM-DD HH:mm:ss');

      await transaction.debitAndUpdate(userId, amountDue, {
        totalLink: plan.maxLinks,
        planId: user.planId,
        isActive: true,
        expiredAt: renewedExpiredAt,
      });

      return {
        message: 'Gia hạn dịch vụ thành công.',
        balance: user.balance - amountDue,
        expiredAt: renewedExpiredAt,
      };
    });
  }
}
