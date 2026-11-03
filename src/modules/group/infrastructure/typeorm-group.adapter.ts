import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupPort } from '../application/group.port';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { GroupEntity } from '../entities/group.entity';

@Injectable()
export class TypeOrmGroupAdapter implements GroupPort {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly repository: Repository<GroupEntity>,
  ) {}

  create(input: CreateGroupDto, ownerId: number) {
    return this.repository.save({ ...input, userId: ownerId });
  }

  findAll(ownerFilter: number | null) {
    const query = this.repository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.user', 'u')
      .loadRelationCountAndMap('g.totalLink', 'g.links')
      .select(['g.id', 'g.name', 'u.username'])
      .orderBy('g.id', 'DESC');

    if (ownerFilter !== null) {
      query.where('g.userId = :ownerId', { ownerId: ownerFilter });
    }
    return query.getMany();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  async findOwned(id: number, ownerId: number) {
    return Boolean(
      await this.repository.findOne({ where: { id, userId: ownerId } }),
    );
  }

  update(id: number, input: UpdateGroupDto) {
    return this.repository.save({ id, ...input });
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}
