import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserCreationPort } from '../application/user.port';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class TypeOrmUserCreationAdapter implements UserCreationPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async usernameExists(username: string) {
    return Boolean(await this.repository.findOne({ where: { username } }));
  }

  save(user: Partial<UserEntity>) {
    return this.repository.save(user);
  }

  initializeConfiguration(userId: number) {
    return this.dataSource.query(
      'INSERT INTO config (user_id) VALUES ($1)',
      [userId],
    );
  }
}
