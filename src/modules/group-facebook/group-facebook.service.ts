import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupFacebookEntity } from './entities/group-facebook.entity';
import { CreateGroupFacebookDto } from './dto/create-group-facebook.dto';
import { UpdateGroupFacebookDto } from './dto/update-group-facebook.dto';
import { LEVEL } from '../user/entities/user.entity';

@Injectable()
export class GroupFacebooService {
  constructor(
    @InjectRepository(GroupFacebookEntity)
    private repo: Repository<GroupFacebookEntity>,
  ) { }

  async create(params: CreateGroupFacebookDto, userId: number) {
    return this.repo.save({ ...params, userId })
  }

  findAll(userId: number, level: LEVEL) {
    if (level === LEVEL.ADMIN) {
      return this.repo.find({
        order: {
          id: 'DESC'
        }
      })
    }
    return this.repo.find({
      where: {
        userId
      },
      order: {
        id: 'DESC'
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

  update(id: number, params: UpdateGroupFacebookDto) {
    return this.repo.save({ id, ...params })
  }

  remove(id: number) {
    return this.repo.delete(id)
  }
}
