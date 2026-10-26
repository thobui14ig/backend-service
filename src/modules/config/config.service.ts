import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigEntity } from './entities/config.entity';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(ConfigEntity)
    private readonly configRepository: Repository<ConfigEntity>,
  ) {}

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
}
