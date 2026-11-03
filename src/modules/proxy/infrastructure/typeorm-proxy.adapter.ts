import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProxyPort } from '../application/proxy.port';
import { IGetProxy } from '../proxy.controller.i';
import { ProxyEntity, ProxyStatus } from '../entities/proxy.entity';

@Injectable()
export class TypeOrmProxyAdapter implements ProxyPort {
  constructor(
    @InjectRepository(ProxyEntity)
    private readonly repository: Repository<ProxyEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async exists(address: string) {
    return Boolean(
      await this.repository.findOne({ where: { proxyAddress: address } }),
    );
  }

  saveMany(proxies: Array<Partial<ProxyEntity>>) {
    return this.repository.save(proxies);
  }

  findAll(filters: IGetProxy) {
    return this.repository.find({
      order: { id: 'DESC' },
      where: {
        ...(filters.isFbBlock == null
          ? {}
          : { isFbBlock: filters.isFbBlock }),
        ...(filters.status == null
          ? {}
          : {
              status: filters.status
                ? ProxyStatus.ACTIVE
                : ProxyStatus.IN_ACTIVE,
            }),
      },
    });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  remove(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const record = await manager
        .getRepository(ProxyEntity)
        .createQueryBuilder('proxy')
        .setLock('pessimistic_write')
        .where('proxy.id = :id', { id })
        .getOneOrFail();
      await manager.remove(record);
    });
  }

  removeMany(ids: number[]) {
    return this.repository.delete(ids);
  }
}
