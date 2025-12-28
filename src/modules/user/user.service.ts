import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class UserService {
  vnTimezone = 'Asia/Bangkok';
  constructor(
    @InjectRepository(UserEntity)
    private repo: Repository<UserEntity>,
    private connection: DataSource,
  ) { }

  async findByEmail(username: string) {
    const res = await this.connection.query(`
            SELECT
            u.id,
            u.username,
            u.password,
            u.created_at::TEXT as createdAt,
            u.expired_at::TEXT as expiredAt,
            u.link_limit as linkLimit,
            u.level
        FROM users u
        WHERE u.username = '${username}' and u.is_deleted = false;
      `)
    if (res && res.length > 0) {
      const user = res[0]
      user.password = user.password

      return user
    }

    return null
  }

  create(user: CreateUserDto) {
    return this.repo.save(user);
  }

  findById(id: number) {
    return this.repo.findOne({
      where: {
        id,
      },
    });
  }

  async getAll() {
    const res = await this.connection.query(`
      SELECT 
          u.id,
          u.username,
          u.created_at as createdAt,
          u.expired_at as expiredAt,
          u.link_on_limit as linkOnLimit,
          u.link_off_limit as linkOffLimit,
          u.link_on_hide_limit as linkOnHideLimit,
          u.link_off_hide_limit as linkOffHideLimit,
          u.level,
          u.delay_on_private as delayOnPrivate,
          u.delay_on_public as delayOnPublic,
          u.get_phone as getPhone,
          (SELECT COUNT(*) FROM links l2 WHERE l2.user_id = u.id AND l2.status = 'started' AND l2.hide_cmt = FALSE AND l2.is_deleted = false) AS totalRunning,
          (SELECT COUNT(*) FROM links l3 WHERE l3.user_id = u.id AND l3.status = 'pending' AND l3.hide_cmt = FALSE AND l3.is_deleted = false) AS totalPending,
          (SELECT COUNT(*) FROM links l4 WHERE l4.user_id = u.id AND l4.status = 'started' AND l4.hide_cmt = TRUE AND l4.is_deleted = false) AS totalLinkHideRunning,
		  (SELECT COUNT(*) FROM links l5 WHERE l5.user_id = u.id AND l5.status = 'pending' AND l5.hide_cmt = TRUE AND l5.is_deleted = false) AS totalLinkHidePending
      FROM users u where u.is_deleted = false
      ORDER BY u.id DESC;
      `)
    return res.map((item) => {
      return {
        ...item,
        expiredAt: dayjs(item.expiredAt).format('YYYY-MM-DD'),
      }
    })
  }

  delete(id: number) {
    // return this.repo.delete(id);
    // return this.repo.update(id, { isDelete: true })
  }

  update(user: UpdateUserDto) {
    return this.repo.save(user);
  }

  async getInfo(userId: number) {
    const res = await this.repo.findOne({
      where: {
        id: userId,
        isDelete: false
      },
      select: {
        id: true, 
        username: true,
        level: true
      }
    })

    delete res.password
    return res;
  }
}
