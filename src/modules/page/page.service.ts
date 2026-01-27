import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LEVEL, UserEntity } from '../user/entities/user.entity';
import { UpdatePageDto } from './dto/update-group.dto';
import { PageEntity } from './entities/page.entity';
import { CreatePageDto } from './dto/create-group.dto';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(PageEntity)
    private repo: Repository<PageEntity>,
  ) { }

  async create(params: CreatePageDto, userId: number) {
    const arg = { ...params, userId }
    return this.repo.save(arg)
  }

  findAll(user: UserEntity) {
    if (user.level == LEVEL.ADMIN) {
      return this.repo.find({
        order: {
          id: "DESC"
        }
      })      
    }
    return this.repo.find({
      where: {
        userId: user.id
      },
      order: {
        id: "DESC"
      }
    })
  }

  findOne(id: number) {
    return this.repo.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, params: UpdatePageDto, userId: number) {
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

  async remove(id: number, userId: number) {
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
