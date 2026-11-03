import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { LEVEL, UserEntity } from '../../user/entities/user.entity';
import { UserNotFoundError } from '../application/configuration.errors';
import {
  ConfigUser,
  ConfigurationPort,
  ConfigurationRecord,
  ConfigurationsForUsersRecord,
} from '../application/configuration.port';
import { UpdateConfigurationInput } from '../application/configuration.types';
import { ConfigEntity } from '../entities/config.entity';

@Injectable()
export class TypeOrmConfigurationAdapter implements ConfigurationPort {
  constructor(
    @InjectRepository(ConfigEntity)
    private readonly configRepository: Repository<ConfigEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  getConfigurationsForUsers(): Promise<ConfigurationsForUsersRecord[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoin(ConfigEntity, 'config', 'config.userId = user.id')
      .select('user.id', 'userId')
      .addSelect('user.username', 'username')
      .addSelect('config.id IS NOT NULL', 'hasConfig')
      .addSelect('config.excelId', 'excelId')
      .addSelect('config.linkId', 'linkId')
      .addSelect('config.isOrder', 'isOrder')
      .addSelect('config.isConvertUid', 'isConvertUid')
      .where('user.isDelete = false')
      .andWhere('user.level IN (:...levels)', {
        levels: [LEVEL.ADMIN, LEVEL.USER, LEVEL.RESELLER],
      })
      .andWhere('user.username != :username', { username: 'test' })
      .orderBy('user.id', 'DESC')
      .getRawMany();
  }

  async getConfig(userId: number): Promise<ConfigurationRecord | null> {
    const config = await this.configRepository.findOne({
      where: { userId: String(userId) },
      select: {
        userId: true,
        excelId: true,
        linkId: true,
        isOrder: true,
        isConvertUid: true,
      },
    });

    if (!config) return null;

    return {
      userId: config.userId,
      excelId: config.excelId,
      linkId: config.linkId,
      isOrder: config.isOrder,
      isConvertUid: config.isConvertUid,
    };
  }

  async findActiveUser(userId: number): Promise<ConfigUser | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isDelete: false },
      select: { id: true, level: true },
    });

    if (!user || user.id === undefined) return null;
    return {
      id: user.id,
      role: user.level === LEVEL.RESELLER ? 'reseller' : 'other',
    };
  }

  async saveConfigurations(
    userId: number,
    propagateToSubUsers: boolean,
    input: UpdateConfigurationInput,
  ): Promise<ConfigurationRecord> {
    return this.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(UserEntity);
      const user = await users.findOne({
        where: { id: userId, isDelete: false },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) {
        throw new UserNotFoundError();
      }

      const userIds = [userId];
      if (propagateToSubUsers && user.level === LEVEL.RESELLER) {
        const subUsers = await users.find({
          where: {
            parentId: userId,
            level: LEVEL.SUB_USER,
            isDelete: false,
          },
          select: { id: true },
        });
        userIds.push(
          ...subUsers
            .map((subUser) => subUser.id)
            .filter((id): id is number => id !== undefined),
        );
      }

      const repository = manager.getRepository(ConfigEntity);
      const existing = await repository.find({
        where: { userId: In(userIds.map(String)) },
      });
      const configsByUserId = new Map(
        existing.map((config) => [config.userId, config]),
      );
      const configsToSave = userIds.map((userId) => {
        const config =
          configsByUserId.get(String(userId)) ??
          repository.create({ userId: String(userId) });
        config.excelId = String(input.excelId);
        config.linkId = String(input.linkId);
        config.isOrder = input.isOrder;
        config.isConvertUid = input.isConvertUid;
        return config;
      });
      const saved = await repository.save(configsToSave);
      const updated = saved.find((config) => config.userId === String(userIds[0]));

      if (!updated) {
        throw new Error('Configuration persistence returned no owner record.');
      }

      return {
        userId: updated.userId,
        excelId: updated.excelId,
        linkId: updated.linkId,
        isOrder: updated.isOrder,
        isConvertUid: updated.isConvertUid,
      };
    });
  }
}
