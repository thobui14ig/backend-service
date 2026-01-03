import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupFacebookEntity } from './entities/group-facebook.entity';
import { CreateGroupFacebookDto } from './dto/create-group-facebook.dto';
import { UpdateGroupFacebookDto } from './dto/update-group-facebook.dto';

@Injectable()
export class GroupFacebooService {
  constructor(
    @InjectRepository(GroupFacebookEntity)
    private repo: Repository<GroupFacebookEntity>,
  ) { }

  async create(params: CreateGroupFacebookDto) {
    return this.repo.save(params)
  }

  findAll() {
    return this.repo.find()
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
