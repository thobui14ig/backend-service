import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupEntity } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { LEVEL, UserEntity } from '../user/entities/user.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private repo: Repository<GroupEntity>,
  ) { }

  async create(params: CreateGroupDto, userId: number) {
    const arg = { ...params, userId }
    return this.repo.save(arg)
  }

  findAll(user: UserEntity, userId?: number) {
    const query = this.repo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.user', 'u')
      .loadRelationCountAndMap('g.totalLink', 'g.links')
      .select([
        'g.id',
        'g.name',
        'u.username',
      ])
      .orderBy('g.id', 'DESC');

    if (user.level === LEVEL.ADMIN && userId !== undefined) {
      query.where('g.userId = :userId', { userId });
    } else if (user.level !== LEVEL.ADMIN) {
      query.where('g.userId = :userId', {
        userId: user.id,
      });
    }

    return query.getMany();
  }

  findOne(id: number) {
    return this.repo.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, params: UpdateGroupDto, userId: number, level: LEVEL) {
    if (level === LEVEL.ADMIN) {
      return this.repo.save({ id, ...params })
    }
    const group = await this.repo.findOne({
      where: {
        id,
        userId
      }
    })
    if (group) {
      return this.repo.save({ id, ...params })
    }

    throw new ForbiddenException('Bạn không có quyền');
  }

  async remove(id: number, userId: number, level: LEVEL) {
    if (level === LEVEL.ADMIN) {
      return this.repo.delete(id)
    }
    const group = await this.repo.findOne({
      where: {
        id,
        userId
      }
    })
    
    if (group) {
      return this.repo.delete(id)
    }

    throw new ForbiddenException('Bạn không có quyền');
  }
}
