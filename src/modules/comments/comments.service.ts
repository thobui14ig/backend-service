import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { DataSource, Repository } from 'typeorm';
import { LEVEL, UserEntity } from '../user/entities/user.entity';
import { IGetCommentParams } from './comments.service.i';
import { CommentEntity } from './entities/comment.entity';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private repo: Repository<CommentEntity>,
    private readonly connection: DataSource,
  ) { }
  async findAll(user: UserEntity, params: IGetCommentParams) {
    const vnNowStart = dayjs(params.startDate).tz(params.timezone)
    const vnNowEnd = dayjs(params.endDate).tz(params.timezone)
    const startDate = vnNowStart.startOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
    const endDate = vnNowEnd.endOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
    const keyword = params?.keyword?.length > 0 ? params?.keyword?.trim() : null

    let response = []
    const limit = params.limit
    const offset = params.offset

    let condition = user.level as LEVEL === LEVEL.ADMIN ? `` : `l.user_id = ${user.id} AND `
    if (params.groupId) {
      condition += ` l.group_id = ${params.groupId} AND `
    }  

    if (params.pageId) {
      condition += ` l.page_id = '${params.pageId}' AND `
    }
    const query = `
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
          json_build_object(
              'id', l.id,
              'linkName', l.link_name,
              'linkUrl', l.link_url
          ) AS link,
          COUNT(*) OVER() AS totalCount
      FROM comments c
      JOIN links l 
          ON l.id = c.link_id and l.is_deleted = false and l.is_link_group = false
      WHERE 
        ${condition}
        ${startDate && endDate ?  `c.created_at BETWEEN '${startDate}' AND '${endDate}'` : ""}
        
          ${keyword ? `AND (
            c.message::text ~* '${keyword}' 
            OR c.post_id::text ~* '${keyword}'
            OR c.user_uid::text ~* '${keyword}'
            OR c.username::text ~* '${keyword}'
            OR c.phone_number::text ~* '${keyword}'
          )` : ""}
      ORDER BY c.created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `
    response = await this.connection.query(query)
    return {
      data: response,
      totalCount: response.length > 0 ? response[0].totalCount : 0,
    }
  }

  findOne(id: number) {
    return this.repo.findOne({
      where: {
        id
      }
    })
  }
}
