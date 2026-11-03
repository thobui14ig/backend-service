import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import * as timezonePlugin from 'dayjs/plugin/timezone';
import * as utcPlugin from 'dayjs/plugin/utc';
import {
  CommentSearch,
  CommentsPort,
} from '../application/comments.port';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentEntity } from '../entities/comment.entity';
import { LinkEntity } from '../../links/entities/links.entity';

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);

@Injectable()
export class TypeOrmCommentsAdapter implements CommentsPort {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repository: Repository<CommentEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async search(input: CommentSearch): Promise<{ data: unknown[]; totalCount: number }> {
    const { params } = input;
    const isExport = params.isExport ?? false;
    const isGetPhone = params.hasPhone ?? false;
    const startDate = params.startDate
      ? this.toUtcBoundary(params.startDate, params.timezone, 'start')
      : null;
    const endDate = params.endDate
      ? this.toUtcBoundary(params.endDate, params.timezone, 'end')
      : null;
    const keyword = params.keyword?.trim() || null;
    const conditions = [
      'l.is_deleted = false',
      'l.is_link_group = false',
      'l.platform = $1',
    ];
    const values: unknown[] = [params.platform];
    const addCondition = (sql: string, ...conditionValues: unknown[]) => {
      let parameterIndex = values.length;
      const parameterized = sql.replace(/\?/g, () => `$${++parameterIndex}`);
      values.push(...conditionValues);
      conditions.push(parameterized);
    };

    if (input.userId !== null) addCondition('l.user_id = ?', input.userId);
    if (params.groupId) addCondition('l.group_id = ?', params.groupId);
    if (params.pageId) addCondition('l.page_id = ?', params.pageId);
    if (isGetPhone) conditions.push('c.phone_number IS NOT NULL');
    if (startDate && endDate) {
      addCondition('c.created_at BETWEEN ? AND ?', startDate, endDate);
    }
    if (keyword) {
      values.push(keyword);
      const keywordParam = `$${values.length}`;
      conditions.push(`(
        c.message::text ~* ${keywordParam}
        OR c.post_id::text ~* ${keywordParam}
        OR c.user_uid::text ~* ${keywordParam}
        OR c.username::text ~* ${keywordParam}
        OR c.phone_number::text ~* ${keywordParam}
      )`);
    }

    const where = conditions.join(' AND ');
    const countValues = [...values];
    const limitIndex = values.length + 1;
    const offsetIndex = values.length + 2;
    values.push(params.limit, params.offset);
    const selectQuery = `
      SELECT
        c.id,
        c.post_id AS "postId",
        c.user_uid AS "userUid",
        c.username,
        c.message,
        c.created_at::TEXT AS "createdAt",
        c.phone_number AS "phoneNumber",
        c.cmt_id AS "cmtId",
        c.link_id AS "linkId",
        c.order_status AS "orderStatus",
        json_build_object(
          'id', l.id,
          'linkName', l.link_name,
          'linkUrl', l.link_url
        ) AS link
      FROM comments c
      JOIN links l ON l.id = c.link_id
      WHERE ${where}
      ORDER BY c.created_at ${isExport ? 'ASC' : 'DESC'}
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;
    const countQuery = `
      SELECT COUNT(*) AS "totalCount"
      FROM comments c
      JOIN links l ON l.id = c.link_id
      WHERE ${where}
    `;

    const [data, count] = await Promise.all([
      this.dataSource.query(selectQuery, values),
      this.dataSource.query(countQuery, countValues),
    ]);

    return {
      data,
      totalCount: data.length > 0 ? count[0].totalCount : 0,
    };
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  async updateForOwnedLink(
    commentId: number,
    userId: number,
    update: Pick<UpdateCommentDto, 'orderStatus' | 'address' | 'note'>,
  ) {
    const owned = await this.ownedComment(commentId, userId);
    if (!owned) return null;
    return this.repository.update({ id: commentId }, update);
  }

  async updateOrderStatusForOwnedLink(
    commentId: number,
    userId: number,
    orderStatus: UpdateCommentDto['orderStatus'],
  ) {
    const owned = await this.ownedComment(commentId, userId);
    if (!owned) return null;
    return this.repository.update({ id: commentId }, { orderStatus });
  }

  private async ownedComment(commentId: number, userId: number) {
    return this.repository
      .createQueryBuilder('comment')
      .innerJoin(
        LinkEntity,
        'link',
        'link.id = comment.linkId AND link.userId = :userId',
        { userId },
      )
      .where('comment.id = :commentId', { commentId })
      .getOne();
  }

  private toUtcBoundary(
    value: string,
    timezone: string,
    edge: 'start' | 'end',
  ): string {
    const date = dayjs(value).tz(timezone);
    return (edge === 'start' ? date.startOf('day') : date.endOf('day'))
      .utc()
      .format('YYYY-MM-DD HH:mm:ss');
  }
}
