import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { LEVEL, UserEntity } from '../user/entities/user.entity';
import { ConfigEntity } from './entities/config.entity';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(ConfigEntity)
    private readonly configRepository: Repository<ConfigEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  getConfigsForUsers() {
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

  async getConfig(
    userId: number,
  ): Promise<
    Pick<
      ConfigEntity,
      'userId' | 'excelId' | 'linkId' | 'isOrder' | 'isConvertUid'
    > | null
  > {
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

  async getConfigForUser(userId: number) {
    const config = await this.getConfig(userId);
    if (!config) {
      throw new NotFoundException('Không tìm thấy cấu hình của user.');
    }
    return config;
  }

  async updateConfigForUser(userId: number, input: UpdateConfigDto) {
    return this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(UserEntity);
      const configRepository = manager.getRepository(ConfigEntity);
      const user = await userRepository.findOne({
        where: { id: userId, isDelete: false },
      });

      if (!user) {
        throw new NotFoundException('Không tìm thấy user.');
      }

      const config =
        (await configRepository.findOne({
          where: { userId: String(userId) },
        })) ?? configRepository.create({ userId: String(userId) });

      config.excelId = String(input.excelId);
      config.linkId = String(input.linkId);
      config.isOrder = input.isOrder;
      config.isConvertUid = input.isConvertUid;

      const updated = await configRepository.save(config);

      if (user.level === LEVEL.RESELLER) {
        const subUsers = await userRepository.find({
          where: {
            parentId: userId,
            level: LEVEL.SUB_USER,
            isDelete: false,
          },
          select: { id: true },
        });
        const subUserIds = subUsers
          .map((subUser) => subUser.id)
          .filter((id): id is number => id !== undefined);

        if (subUserIds.length > 0) {
          const subUserConfigs = await configRepository.find({
            where: { userId: In(subUserIds.map(String)) },
          });
          const configsByUserId = new Map(
            subUserConfigs.map((subUserConfig) => [
              subUserConfig.userId,
              subUserConfig,
            ]),
          );
          const configsToSave = subUserIds.map((subUserId) => {
            const subUserConfig =
              configsByUserId.get(String(subUserId)) ??
              configRepository.create({ userId: String(subUserId) });
            subUserConfig.excelId = String(input.excelId);
            subUserConfig.linkId = String(input.linkId);
            subUserConfig.isOrder = input.isOrder;
            subUserConfig.isConvertUid = input.isConvertUid;
            return subUserConfig;
          });

          await configRepository.save(configsToSave);
        }
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
