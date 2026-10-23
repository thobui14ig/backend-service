import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { DataSource, Repository } from 'typeorm';
import { LEVEL, UserEntity } from '../user/entities/user.entity';
import { IGetCommentParams } from './comments.service.i';
import { CommentEntity } from './entities/comment.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LinkService } from '../links/links.service';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private repo: Repository<CommentEntity>,
    private readonly connection: DataSource,
    private readonly linkService: LinkService
  ) { }
  async findAll(user: UserEntity, params: IGetCommentParams) {
    const isExport = params.isExport ?? false
    const isGetPhone = params.hasPhone ?? false
    const vnNowStart = dayjs(params.startDate).tz(params.timezone)
    const vnNowEnd = dayjs(params.endDate).tz(params.timezone)
    const startDate = params.startDate ? vnNowStart.startOf('day').utc().format('YYYY-MM-DD HH:mm:ss') : null
    const endDate = params.endDate ? vnNowEnd.endOf('day').utc().format('YYYY-MM-DD HH:mm:ss') : null
    const keyword = params?.keyword?.length > 0 ? params?.keyword?.trim() : null
    const platform = params.platform

    const limit = params.limit
    const offset = params.offset

    let condition = user.level as LEVEL === LEVEL.ADMIN ? `` : `l.user_id = ${user.id} AND `
    if (params.groupId) {
      condition += ` l.group_id = ${params.groupId} AND `
    }  

    if (params.pageId) {
      condition += ` l.page_id = '${params.pageId}' AND `
    }

    if (isGetPhone) {
      condition += ` c.phone_number IS NOT NULL AND `
    }
    const querySelect = `
      SELECT 
          c.id,
          c.post_id       AS "postId",
          c.user_uid AS "userUid",
          c.username,
          c.message,
          c.created_at::TEXT  AS "createdAt",
          c.phone_number  AS "phoneNumber",
          c.cmt_id        AS "cmtId",
          c.link_id       AS "linkId",
          c.order_status AS "orderStatus",
          json_build_object(
              'id', l.id,
              'linkName', l.link_name,
              'linkUrl', l.link_url
          ) AS link
      FROM comments c
      JOIN links l 
          ON l.id = c.link_id and l.is_deleted = false and l.is_link_group = false and l.platform = '${platform}'
      WHERE 
        ${condition}
        ${startDate && endDate ?  `c.created_at BETWEEN '${startDate}' AND '${endDate}' AND` : ""}
        ${keyword ? `(
            c.message::text ~* '${keyword}' 
            OR c.post_id::text ~* '${keyword}'
            OR c.user_uid::text ~* '${keyword}'
            OR c.username::text ~* '${keyword}'
            OR c.phone_number::text ~* '${keyword}'
          )` : "1=1"}
      ORDER BY c.created_at ${isExport ? "ASC" : "DESC"}
      LIMIT ${limit} OFFSET ${offset};
    `
    const queryCount = `
      SELECT 
          COUNT(*) AS "totalCount"
      FROM comments c
      JOIN links l 
          ON l.id = c.link_id and l.is_deleted = false and l.is_link_group = false and l.platform = '${platform}'
      WHERE 
        ${condition}
        ${startDate && endDate ?  `c.created_at BETWEEN '${startDate}' AND '${endDate}' AND` : ""}
        ${keyword ? `(
            c.message::text ~* '${keyword}' 
            OR c.post_id::text ~* '${keyword}'
            OR c.user_uid::text ~* '${keyword}'
            OR c.username::text ~* '${keyword}'
            OR c.phone_number::text ~* '${keyword}'
          )` : "1=1"};
    `
    const [responseSelect, resCount] = await Promise.all([
      this.connection.query(querySelect),
      this.connection.query(queryCount),
    ]);

    return {
      data: responseSelect,
      totalCount: responseSelect.length > 0 ? resCount[0].totalCount : 0,
    }
  }

  findOne(id: number) {
    return this.repo.findOne({
      where: {
        id
      }
    })
  }

  async updateStatus(body: UpdateCommentDto, userId: number) {
    const comment = await this.repo.findOne({
      where: {
        id: body.id
      }
    })

    if (comment) {
      const link = await this.linkService.getOneByUser(comment.linkId, userId)
      if (link) {
        return await this.repo.update(
          { id: body.id },
          { orderStatus: body.orderStatus, address: body.address, note: body.note },
        );
      }
    }
    throw new ForbiddenException(
      'Bạn không có quyền cập nhật link này',
    );
  }

  async updateCommentStatus(body: Pick<UpdateCommentDto, 'id' | 'orderStatus'>, userId: number) {
    const comment = await this.repo.findOne({
      where: {
        id: body.id
      }
    })

    if (comment) {
      const link = await this.linkService.getOneByUser(comment.linkId, userId)
      if (link) {
        return await this.repo.update(
          { id: body.id },
          { orderStatus: body.orderStatus },
        );
      }
    }
    throw new ForbiddenException(
      'Bạn không có quyền cập nhật link này',
    );
  }
}
