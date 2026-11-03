import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TokenPort } from '../application/token.port';
import { TokenEntity } from '../entities/token.entity';

@Injectable()
export class TypeOrmTokenAdapter implements TokenPort {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly repository: Repository<TokenEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async exists(tokenValue: string) {
    return Boolean(await this.repository.findOne({ where: { tokenValue } }));
  }

  saveMany(tokens: Array<Partial<TokenEntity>>) {
    return this.repository.save(tokens);
  }

  findAll() {
    return this.repository.find({ order: { id: 'DESC' } });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  remove(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const record = await manager
        .getRepository(TokenEntity)
        .createQueryBuilder('token')
        .setLock('pessimistic_write')
        .where('token.id = :id', { id })
        .getOneOrFail();
      await manager.remove(record);
    });
  }
}
