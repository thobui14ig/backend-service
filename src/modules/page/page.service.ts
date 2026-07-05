import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LEVEL, UserEntity } from '../user/entities/user.entity';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageEntity } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UserService } from '../user/user.service';
import { getPlan } from 'src/common/utils/plan';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(PageEntity)
    private repo: Repository<PageEntity>,
    private userService: UserService,
    private connection: DataSource,
    private httpService: HttpService,
  ) { }

  async create(params: CreatePageDto, userId: number) {
    const arg = { ...params, userId }
    const totalPage = await this.getTotalPage(userId)
    const user = await this.userService.getInfo(userId)
    const plan = getPlan(user.planId, user.id)

    if (totalPage >= plan.maxPage) {
      throw new HttpException(
          `Vip${plan.id} chỉ được thêm tối đa ${plan.maxPage} page`,
          HttpStatus.BAD_REQUEST,
      );      
    }
    await this.restartCronJob()
    return this.repo.save(arg)
  }

  restartCronJob() {
    return lastValueFrom(this.httpService.get(`http://${process.env.CRON_JOB_SERVICE}/restart`));
  }

  getTotalPage(userId: number) {
    return this.repo.count({
      where: {
        userId,
      },
    });
  }

  findAll(user: UserEntity) {
    let condition = ""

    if (user.level != LEVEL.ADMIN) {
      condition += `where p.user_id = ${user.id}`
    }

    return this.connection.query(`
      select p.id,
      p.user_id as "userId",
      p.page_id as "pageId",
      p.name,
      p.is_active as "isActive",
      u.username as "username",
      COUNT(l.id) AS "totalLink" 
      from page p
      left join links l on l.page_id = p.page_id  ${ user.level != LEVEL.ADMIN ? `AND l.user_id=${user.id}` : ""}
      left join users u on u.id = p.user_id
      ${condition}
      group by p.id  , u.username 
      order by p.id desc
    `)
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
    const page = await this.repo.findOne({
      where: {
        id,
        userId
      }
    })
    
    if (page) {
      return this.repo.delete(id)
    }

    throw new ForbiddenException('Bạn không có quyền');
  }
}
