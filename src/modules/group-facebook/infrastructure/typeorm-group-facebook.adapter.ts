import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupFacebookPort } from '../application/group-facebook.port';
import { CreateGroupFacebookDto } from '../dto/create-group-facebook.dto';
import { UpdateGroupFacebookDto } from '../dto/update-group-facebook.dto';
import { GroupFacebookEntity } from '../entities/group-facebook.entity';

@Injectable()
export class TypeOrmGroupFacebookAdapter implements GroupFacebookPort {
  constructor(
    @InjectRepository(GroupFacebookEntity)
    private readonly repository: Repository<GroupFacebookEntity>,
  ) {}

  create(input: CreateGroupFacebookDto, userId: number) {
    return this.repository.save({ ...input, userId });
  }

  findAll(userId: number | null) {
    return this.repository.find({
      ...(userId === null ? {} : { where: { userId } }),
      order: { id: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  update(id: number, input: UpdateGroupFacebookDto) {
    return this.repository.save({ id, ...input });
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}
