import { HttpService } from '@nestjs/axios';
import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { DataSource, Repository } from 'typeorm';
import { LinkService } from '../links/links.service';
import { LEVEL, UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageEntity } from './entities/page.entity';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(PageEntity)
    private repo: Repository<PageEntity>,
    private userService: UserService,
    private connection: DataSource,
    private httpService: HttpService,
    private linkService: LinkService,

  ) { }

  async create(params: CreatePageDto, userId: number) {
    const arg = { ...params, userId }
    const totalPage = await this.getTotalPage(userId)
    const user = await this.userService.getInfo(userId)

    if (totalPage >= user.maxPage) {
      throw new HttpException(
          `Tài khoản của bạn chỉ được thêm tối đa ${user.maxPage} page`,
          HttpStatus.BAD_REQUEST,
      );      
    }
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
      left join links l on l.page_id = p.page_id AND l.user_id=p.user_id ${ user.level != LEVEL.ADMIN ? `AND l.user_id=${user.id}` : ""}
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
    
    await this.linkService.deleteLinkByPage(page.pageId, user.id)
    return this.repo.delete(id)
  }
}
