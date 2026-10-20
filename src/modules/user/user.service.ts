import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LEVEL, UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class UserService {
  vnTimezone = 'Asia/Bangkok';
  constructor(
    @InjectRepository(UserEntity)
    private repo: Repository<UserEntity>,
    private connection: DataSource,
  ) { }

  async findByEmail(username: string) {
    const res = await this.connection.query(`
            SELECT
            u.id,
            u.username,
            u.password,
            u.created_at::TEXT as createdAt,
            u.level
        FROM users u
        WHERE u.username = '${username}' and u.is_deleted = false;
      `)
    if (res && res.length > 0) {
      const user = res[0]
      user.password = user.password

      return user
    }

    return null
  }

  async create(dto: CreateUserDto) {
    const user = {
      ...dto,
      username: dto.username.trim().toLowerCase(),
      password: dto.password.trim(),
      phone: dto.phone.trim(),
    };
    const isExist = await this.repo.findOne({
      where: {
        username: user.username
      }
    })

    if (isExist) {
      throw new HttpException(
        `User đã tồn tại.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const res = await this.repo.save(user);
    return this.connection.query(`
      INSERT INTO config (user_id)
      VALUES (${res.id});
    `)
  }

  async findById(id: number) {
    const res = await this.repo.findOne({
      where: {
        id,
      },
    });
    delete res.password

    return res
  }

  async getAll() {
    return this.repo
      .createQueryBuilder('user')
      .where('user.is_deleted = false and user.level = 0')
      .select([
        'user.id',
        'user.username',
        'user.level',
        'user.language',
        'user.balance',
        'user.planId',
        'user.expiredAt',
        'user.isActive',
        'user.isGetPhone',
        'user.lastActiveAt',
      ])
      .loadRelationCountAndMap('user.totalLink', 'user.links')
      .loadRelationCountAndMap('user.totalPage', 'user.pages')
      .andWhere("user.username != :name", { name: "test" })
      .orderBy("is_active", "DESC")
      .getMany();
  }

  async delete(id: number) {
    try {
      return await this.repo.delete(id);
      
    } catch (error) {
      console.log(error)
    }
  }

  update(user: UpdateUserDto) {
    return this.repo.save(user);
  }

  async getInfo(userId: number) {
    const res = await this.repo.findOne({
      where: {
        id: userId,
        isDelete: false
      },
      select: {
        id: true, 
        username: true,
        level: true,
        balance: true,
        planId: true,
        expiredAt: true,
        typeConfig: true,
        discountAmount: true,
        maxPage: true,
        language: true
      }
    })

    return res;
  }

  async changePass(dto: { password: string }, userId: number) {
    const user = await this.repo.findOne({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new HttpException(
        `User không tồn tại.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    user.password = dto.password

    return this.repo.save(user);
  }

  updateLastActiveAt(userId: number) {
    return this.connection.query(`
      UPDATE users
      SET last_active_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
      WHERE id = ${userId};`)
  }


  getSubUsers(userId: number) {
    return this.repo
      .createQueryBuilder('user')
      .where('user.is_deleted = false and user.level = 3')
      .select([
        'user.id',
        'user.username',
        'user.language',
        'user.balance',
        'user.planId',
        'user.expiredAt',
        'user.isActive',
        'user.isGetPhone',
        'user.lastActiveAt',
      ])
      .andWhere("user.parentId = :userId", { userId })
      .orderBy("id", "DESC")
      .getMany();
  }

  async renewService(targetUserId: number, ownerUserId: number) {
    if (!Number.isInteger(targetUserId)) {
      throw new BadRequestException('userId không hợp lệ.');
    }

    const renewalPrice = 100000;

    return this.connection.transaction(async (manager) => {
      const owner = await manager.findOne(UserEntity, {
        where: { id: ownerUserId, isDelete: false },
        lock: { mode: 'pessimistic_write' },
      });

      if (!owner) {
        throw new BadRequestException('Tài khoản không tồn tại.');
      }

      const targetUser = await manager.findOne(UserEntity, {
        where: {
          id: targetUserId,
          parentId: ownerUserId,
          isDelete: false,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!targetUser) {
        throw new BadRequestException('User không phải cấp dưới của bạn.');
      }

      if (owner.balance < renewalPrice) {
        throw new BadRequestException('Bạn không đủ tiền!');
      }

      const now = dayjs().utc();
      const expiration = targetUser.expiredAt ? dayjs.utc(targetUser.expiredAt) : null;
      const renewalBase = expiration?.isValid() && expiration.isAfter(now) ? expiration : now;
      const renewedExpiredAt = renewalBase.add(1, 'month').format('YYYY-MM-DD HH:mm:ss');

      await manager
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          balance: () => `"balance" - ${renewalPrice}`,
          expiredAt: renewedExpiredAt,
        })
        .where('id = :id', { id: ownerUserId })
        .execute();

      await manager.update(UserEntity, targetUserId, {
        planId: 1,
        isActive: true,
        expiredAt: renewedExpiredAt,
      });

      return {
        message: 'Gia hạn dịch vụ thành công.',
        balance: owner.balance - renewalPrice,
        expiredAt: renewedExpiredAt,
      };
    });
  }
}
