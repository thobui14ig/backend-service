import { HttpService } from '@nestjs/axios';
import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { getPlan } from 'src/common/utils/plan';
import { DataSource, Repository } from 'typeorm';
import { LinkService } from '../links/links.service';
import { LEVEL, UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CreateUserTiktokDto } from './dto/create-user-tiktok.dto';
import { UpdateUserTiktokDto } from './dto/update-user-tiktok.dto';
import { UserTiktokEntity } from './entities/page.entity';

@Injectable()
export class UserTiktokService {
  constructor(
    @InjectRepository(UserTiktokEntity)
    private repo: Repository<UserTiktokEntity>,
    private userService: UserService,
    private connection: DataSource,
    private httpService: HttpService,
    private linkService: LinkService,

  ) { }

  async create(params: CreateUserTiktokDto, userId: number) {
    const arg = { ...params, userId }
    const totalTiktok = await this.getTotalTiktok(userId)
    const user = await this.userService.getInfo(userId)
    const plan = getPlan(user.planId, user.id)

    if (totalTiktok >= plan.maxTiktok) {
      throw new HttpException(
          `Vip${plan.id} chỉ được thêm tối đa ${plan.maxTiktok} tiktok`,
          HttpStatus.BAD_REQUEST,
      );      
    }
    return this.repo.save(arg)
  }

  restartCronJob() {
    return lastValueFrom(this.httpService.get(`http://${process.env.CRON_JOB_SERVICE}/restart`));
  }

  getTotalTiktok(userId: number) {
    return this.repo.count({
      where: {
        userId,
      },
    });
  }

  findAll(user: UserEntity) {
    let condition = ""

    if (user.level != LEVEL.ADMIN) {
      condition += `where tu.user_id = ${user.id}`
    }

    return this.connection.query(`
      select tu.id,
      tu.user_id as "userId",
      tu.nickname,
      tu.name,
      COUNT(l.id) AS "totalLink" 
      from tiktok_users tu
      left join users u on u.id = tu.user_id
      left join links l on l.tiktok_id = tu.id AND l.user_id = tu.user_id ${ user.level != LEVEL.ADMIN ? `AND l.user_id=${user.id}` : ""}
      ${condition}
      group by tu.id  , u.username 
      order by tu.id desc
    `)
  }

  findOne(id: number) {
    return this.repo.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, params: UpdateUserTiktokDto, userId: number) {
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

  async remove(id: number, user: UserEntity) {
    const page = await this.repo.findOne({
      where: {
        id,
      }
    })
    const isAdmin = user.level === LEVEL.ADMIN;
    const isOwner = page.userId === user.id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Bạn không có quyền');
    }
    
    await this.linkService.deleteLinkByTiktok(page.id, user.id)
    return this.repo.delete(id)
  }
}
