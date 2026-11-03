import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserManagementPort } from '../application/user-management.port';
import { UpdateUserDto } from '../dto/update-user.dto';
import { LEVEL, UserEntity } from '../entities/user.entity';

@Injectable()
export class TypeOrmUserManagementAdapter implements UserManagementPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findByEmail(username: string) {
    const [user] = await this.dataSource.query(
      `SELECT
        u.id,
        u.username,
        u.password,
        u.created_at::TEXT AS "createdAt",
        u.level
      FROM users u
      WHERE u.username = $1 AND u.is_deleted = false`,
      [username],
    );
    return user ?? null;
  }

  updateLastActiveAt(userId: number) {
    return this.dataSource.query(
      `UPDATE users
      SET last_active_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
      WHERE id = $1`,
      [userId],
    );
  }

  getAll() {
    return this.repository
      .createQueryBuilder('user')
      .where('user.is_deleted = false and user.level IN (:...levels)', {
        levels: [LEVEL.USER, LEVEL.RESELLER, LEVEL.SUB_USER],
      })
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
      .andWhere('user.username != :name', { name: 'test' })
      .orderBy('is_active', 'DESC')
      .getMany();
  }

  getSubUsers(userId: number) {
    return this.repository
      .createQueryBuilder('user')
      .where('user.is_deleted = false and user.level = :level', {
        level: LEVEL.SUB_USER,
      })
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
      .andWhere('user.parentId = :userId', { userId })
      .orderBy('id', 'DESC')
      .getMany();
  }

  getInfo(userId: number) {
    return this.repository.findOne({
      where: { id: userId, isDelete: false },
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
        language: true,
      },
    });
  }

  async findById(id: number) {
    const user = await this.repository.findOne({
      where: { id },
    });
    if (user) delete user.password;
    return user;
  }

  update(input: UpdateUserDto) {
    return this.repository.save(input);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }

  getForPasswordChange(userId: number) {
    return this.repository.findOne({ where: { id: userId } });
  }

  save(user: UserEntity) {
    return this.repository.save(user);
  }
}
