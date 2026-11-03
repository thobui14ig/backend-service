import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LinkQueryPort } from '../application/link-query.port';
import { LinkListQuery, LinkListResult, LinkOrderRecord } from '../application/link-query.types';
import { LinkEntity } from '../entities/links.entity';
import { LEVEL } from '../../user/entities/user.entity';
import { GetUserInfoUseCase } from '../../user/application/use-cases/manage-users.use-cases';

@Injectable()
export class TypeOrmLinkQueryAdapter implements LinkQueryPort {
  constructor(
    @InjectRepository(LinkEntity)
    private readonly repository: Repository<LinkEntity>,
    private readonly dataSource: DataSource,
    private readonly getUserInfo: GetUserInfoUseCase,
  ) {}

  async getTotalLinks(userId: number) {
    const [count, user] = await Promise.all([
      this.repository.count({ where: { userId } }),
      this.getUserInfo.execute(userId),
    ]);
    return { count, planId: user.planId };
  }

  getOrders(userId: number): Promise<LinkOrderRecord[]> {
    return this.dataSource.query(
      `SELECT
        l.id,
        l.link_name AS "linkName",
        l.post_id AS "postId",
        l.created_at::TEXT AS "createdAt",
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', c.id,
              'postId', c.post_id,
              'userUid', c.user_uid,
              'username', c.username,
              'message', c.message,
              'createdAt', c.created_at::TEXT,
              'phoneNumber', c.phone_number,
              'cmtId', c.cmt_id,
              'address', c.address,
              'note', c.note
            )
            ORDER BY c.created_at DESC
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::jsonb
        ) AS comments
      FROM links l
      LEFT JOIN comments c ON c.link_id = l.id
      WHERE l.user_id = $1 AND c.order_status = 'success'
      GROUP BY l.id, l.link_name, l.post_id, l.created_at
      ORDER BY l.created_at DESC`,
      [userId],
    );
  }

  async getLinks(input: LinkListQuery): Promise<LinkListResult> {
    const {
      filters,
      userLevel,
      userId,
      limit,
      offset,
      platform,
      startDate,
      endDate,
    } = input;
    const {
      type,
      groupId,
      groupAutoId,
      pageId,
      userId: filterUserId,
      tiktokId,
    } = filters;
    const keyword = filters.keyword?.length > 0
      ? filters.keyword.trim()
      : null;
    const queryParams: (string | number)[] = [];
    const queryConditions = ['l.is_deleted = false', 'l.is_link_group = false'];
    const addCondition = (condition: string, value: string | number) => {
      queryParams.push(value);
      queryConditions.push(condition.replace('?', `$${queryParams.length}`));
    };

    if (type) addCondition('l.type = ?', type);
    if (userLevel === LEVEL.USER || userLevel === LEVEL.SUB_USER) {
      addCondition('l.user_id = ?', userId);
    }
    if (groupId) addCondition('l.group_id = ?', groupId);
    if (groupAutoId) addCondition('l.group_auto_id = ?', groupAutoId);
    if (pageId) addCondition('l.page_id = ?', pageId);
    if (filterUserId) addCondition('l.user_id = ?', filterUserId);
    if (tiktokId) addCondition('l.tiktok_id = ?', tiktokId);
    if (platform) addCondition('l.platform = ?', platform);

    if (keyword) {
      queryParams.push(keyword);
      const keywordParam = `$${queryParams.length}`;
      queryConditions.push(`(
        l.post_id::text ~* ${keywordParam}
        OR l.link_name::text ~* ${keywordParam}
        OR l.link_url::text ~* ${keywordParam}
        OR l.status::text ~* ${keywordParam}
        OR u.username::text ~* ${keywordParam}
      )`);
    }

    const baseWhere = queryConditions.join('\n        AND ');
    const limitParam = `$${queryParams.length + 1}`;
    const offsetParam = `$${queryParams.length + 2}`;
    const startDateParam = `$${queryParams.length + 3}`;
    const endDateParam = `$${queryParams.length + 4}`;

    const dataQuery = `
      WITH ranked_links AS (
        SELECT l.id, l.created_at,
          ROW_NUMBER() OVER (
            PARTITION BY l.user_id, l.link_url
            ORDER BY l.created_at DESC, l.id DESC
          ) AS duplicate_rank
        FROM links l
        JOIN users u ON u.id = l.user_id
          AND u.is_active = TRUE AND u.plan_id > 0
        WHERE ${baseWhere}
      ),
      filtered_links AS (
        SELECT id, created_at
        FROM ranked_links
        WHERE duplicate_rank = 1
        ORDER BY created_at DESC, id DESC
        LIMIT ${limitParam}
        OFFSET ${offsetParam}
      )
      SELECT
        l.id,
        l.link_name AS "linkName",
        l.link_url AS "linkUrl",
        l.post_id AS "postId",
        l.delay_time AS "delayTime",
        l.status,
        l.created_at::TEXT AS "createdAt",
        l.last_comment_time::TEXT AS "lastCommentTime",
        u.username,
        l.type,
        l.group_id AS "groupId",
        l.content,
        (
          SELECT p.name
          FROM page p
          WHERE p.page_id = l.page_id AND p.user_id = l.user_id
          ORDER BY p.id DESC
          LIMIT 1
        ) AS "pageName",
        g.name AS "groupName",
        COALESCE(comment_stats.total_comment, 0) AS "totalComment",
        COALESCE(comment_stats.total_comment_today, 0) AS "totalCommentToDay",
        l.total_like AS "totalLike",
        l.total_cmt AS "totalCmt",
        l.thumbnail,
        l.is_get_old_comment AS "isGetOldCmt"
      FROM filtered_links fl
      JOIN links l ON l.id = fl.id
      JOIN users u ON u.id = l.user_id
        AND u.is_active = TRUE AND u.plan_id > 0
      LEFT JOIN group_link g ON l.group_id = g.id
      LEFT JOIN (
        SELECT c.link_id, COUNT(*) AS total_comment,
          COUNT(*) FILTER (
            WHERE c.created_at >= ${startDateParam}
              AND c.created_at < ${endDateParam}
          ) AS total_comment_today
        FROM comments c
        JOIN filtered_links comment_links ON comment_links.id = c.link_id
        GROUP BY c.link_id
      ) comment_stats ON comment_stats.link_id = l.id
      ORDER BY l.created_at DESC, l.id DESC
    `;

    const countQuery = `
      SELECT COUNT(*) AS "totalCount"
      FROM (
        SELECT DISTINCT l.user_id, l.link_url
        FROM links l
        JOIN users u ON u.id = l.user_id
          AND u.is_active = TRUE AND u.plan_id > 0
        WHERE ${baseWhere}
      ) unique_links
    `;

    const [data, count] = await Promise.all([
      this.dataSource.query(dataQuery, [
        ...queryParams,
        limit,
        offset,
        startDate,
        endDate,
      ]),
      this.dataSource.query(countQuery, queryParams),
    ]);

    return {
      data,
      totalCount: Number(count[0]?.totalCount || 0),
    };
  }
}
