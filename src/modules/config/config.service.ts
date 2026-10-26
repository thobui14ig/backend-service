import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ConfigEntity } from './entities/config.entity';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(ConfigEntity)
    private readonly configRepository: Repository<ConfigEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
      .where('user.isDelete = false AND (user.level = 0 OR user.level = 3)')
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
    let config = await this.configRepository.findOne({
      where: { userId: String(userId) },
    });

    if (!config) {
      const user = await this.userRepository.findOne({
        where: { id: userId, isDelete: false },
        select: { id: true },
      });
      if (!user) {
        throw new NotFoundException('Không tìm thấy user.');
      }
      config = this.configRepository.create({ userId: String(userId) });
    }

    config.excelId = String(input.excelId);
    config.linkId = String(input.linkId);
    config.isOrder = input.isOrder;
    config.isConvertUid = input.isConvertUid;

    const updated = await this.configRepository.save(config);
    return {
      userId: updated.userId,
      excelId: updated.excelId,
      linkId: updated.linkId,
      isOrder: updated.isOrder,
      isConvertUid: updated.isConvertUid,
    };
  }
}
