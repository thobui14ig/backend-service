import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { DataSource, In, Repository } from 'typeorm';
import { LEVEL } from '../user/entities/user.entity';
import { UpdateLinkDTO } from './dto/update-link.dto';
import { EPlatform, LinkEntity, LinkStatus, LinkType } from './entities/links.entity';
import { BodyLinkQuery, CreateLinkParams } from './links.service.i';
import { UserService } from '../user/user.service';
import { getPlan } from 'src/common/utils/plan';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(LinkEntity)
    private repo: Repository<LinkEntity>,
    private connection: DataSource,
    private userService: UserService
  ) { }

  async create(params: CreateLinkParams) {
    const linkEntities: Partial<LinkEntity>[] = []
    const linksInValid = [];

    for (const link of params.links) {
      const isExitLink = await this.repo.findOne({
        where: {
          linkUrl: link.url,
          userId: params.userId
        }
      })

      if (!isExitLink) {
        const delayTime = params.userId == 19 || params.userId == 2 || params.userId == 22 || params.userId == 102 ? 1 : (params.userId == 104 ? 2 : 4);
        const entity: Partial<LinkEntity> = {
          userId: params.userId,
          linkUrl: link.url,
          delayTime,
          status: params.status,
          linkName: link.name,
          groupId: params.groupId,
          platform: params.platform,
          postId: params.platform == EPlatform.TIKTOK ? this.extractTikTokVideoId(link.url) : undefined,
          process: params.platform == EPlatform.TIKTOK ? true : undefined,
          type: params.platform == EPlatform.TIKTOK ? LinkType.PUBLIC : undefined,
        }
        linkEntities.push(entity)
        continue
      }

      linksInValid.push(link.url)
    }

    const seenUrls = new Set<string>();
    const uniqueLinks: Partial<LinkEntity>[] = [];

    for (const link of linkEntities) {
      if (link.linkUrl && !seenUrls.has(link.linkUrl)) {
        seenUrls.add(link.linkUrl);
        uniqueLinks.push(link);
      }
    }

    const BATCH_SIZE = 10;

    for (let i = 0; i < uniqueLinks.length; i += BATCH_SIZE) {
      const batch = uniqueLinks.slice(i, i + BATCH_SIZE);
      await this.repo.save(batch);
    }

    throw new HttpException(
      `Thêm thành công ${linkEntities.length} link`,
      HttpStatus.OK,
    );
  }

  extractTikTokVideoId(url: string): string | null {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  }

  getOne(id: number) {
    return this.repo.findOne({
      where: {
        id,
      },
    });
  }

  getOneByUser(id: number, userId: number) {
    return this.repo.findOne({
      where: {
        id,
        userId
      },
    });
  }

  async getAll(body: BodyLinkQuery, level: LEVEL, userIdByUerLogin: number, isFilter: boolean, limit: number, offset: number, platform: EPlatform) {
    const { type, groupId, groupAutoId, timezone, pageId, userId, tiktokId } = body
    const currentDay = dayjs().tz(timezone)
    const startDate = currentDay.startOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
    const endDate = currentDay.endOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
    const keyword = body.keyword?.length > 0 ? body.keyword?.trim() : null
    const queryParams: (string | number)[] = [];
    const queryConditions = ['l.is_deleted = false', 'l.is_link_group = false'];
    const addCondition = (condition: string, value: string | number) => {
      queryParams.push(value);
      queryConditions.push(condition.replace('?', `$${queryParams.length}`));
    };

    if (type) {
      addCondition('l.type = ?', type);
    }
    if (level === LEVEL.USER) {
      addCondition('l.user_id = ?', userIdByUerLogin);
    }

    if (groupId) {
      addCondition('l.group_id = ?', groupId);
    }

    if (groupAutoId) {
      addCondition('l.group_auto_id = ?', groupAutoId);
    }

    if (pageId) {
      addCondition('l.page_id = ?', pageId);
    }

    if (userId) {
      addCondition('l.user_id = ?', userId);
    }

    if (tiktokId) {
      addCondition('l.tiktok_id = ?', tiktokId);
    }

    if (platform) {
      addCondition('l.platform = ?', platform);
    }

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
      WITH filtered_links AS (
        SELECT l.id, l.created_at
        FROM links l
        JOIN users u ON u.id = l.user_id
        WHERE ${baseWhere}
        ORDER BY l.created_at DESC
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
          p.name AS "pageName",
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
      LEFT JOIN page p ON p.page_id = l.page_id AND l.user_id = p.user_id
      LEFT JOIN group_link g ON l.group_id = g.id
      LEFT JOIN (
        SELECT
          c.link_id,
          COUNT(*) AS total_comment,
          COUNT(*) FILTER (
            WHERE c.created_at >= ${startDateParam}
            AND c.created_at < ${endDateParam}
          ) AS total_comment_today
        FROM comments c
        JOIN filtered_links comment_links ON comment_links.id = c.link_id
        GROUP BY c.link_id
      ) comment_stats ON comment_stats.link_id = l.id
      ORDER BY l.created_at DESC
    `;

    const countQuery = `
      SELECT COUNT(*) AS "totalCount"
      FROM links l
      JOIN users u ON u.id = l.user_id
      WHERE ${baseWhere};
    `;

    const [response, countResponse] = await Promise.all([
      this.connection.query(dataQuery, [
      ...queryParams,
      limit,
      offset,
      startDate,
      endDate,
    ]),
     this.connection.query(countQuery, queryParams)
    ]);

    return {
      data: response,
      totalCount: Number(countResponse[0]?.totalCount || 0),
    };
  }


  update(params: UpdateLinkDTO, level: LEVEL, userId: number) {
    const argUpdate: Partial<LinkEntity> = {
      id: params.id,
      linkName: params.linkName,
      groupId: params.groupId
    };

    // Admin mới được sửa các field nhạy cảm
    if (level === LEVEL.ADMIN) {
      argUpdate.delayTime = params.delayTime;
      argUpdate.type = params.type;
    }

    return this.connection.transaction(async (manager) => {
      const repo = manager.getRepository(LinkEntity);

      const record = await repo
        .createQueryBuilder('e')
        .setLock('pessimistic_write')
        .where('e.id = :id', { id: params.id })
        .getOneOrFail();

      // 🔐 CHECK QUYỀN
      const isAdmin = level === LEVEL.ADMIN;
      const isOwner = record.userId === userId;

      if (!isAdmin && !isOwner) {
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật link này',
        );
      }

      Object.assign(record, argUpdate);
      return repo.save(record);
    });
  }


  async delete(id: number, level: LEVEL, userId: number) {
    return this.connection.transaction(async (manager) => {
      const repo = manager.getRepository(LinkEntity);

      const record = await repo
        .createQueryBuilder('e')
        .setLock('pessimistic_write')
        .where('e.id = :id', { id })
        .getOneOrFail();

      const isAdmin = level === LEVEL.ADMIN;
      const isOwner = record.userId === userId;

      if (!isAdmin && !isOwner) {
        throw new ForbiddenException('Bạn không có quyền xoá link này');
      }

      // record.isDelete = true;
      return repo.delete(id);
    });
  }

  async getTotalLinkUserByStatus(userId: number) {
    const count = await this.connection
      .getRepository(LinkEntity)
      .countBy({
        userId,
        isDelete: false
      })

    return count
  }

  async getTotalLinkUserWhenUpdateMultipleLink(userId: number, status: LinkStatus, hideCmt: boolean, linkIds: number[]) {
    const a = await this.getTotalLinkUserByStatus(userId)
    const b = await this.connection
      .getRepository(LinkEntity)
      .countBy({
        userId,
        status: status === LinkStatus.Pending ? LinkStatus.Started : LinkStatus.Pending,
        id: In(linkIds),
        isDelete: false
      })

    return a + b
  }

  async getTotalLink(userId: number) {
    const total = await this.repo.count({
      where: {
        userId
      }
    });
    const user = await this.userService.getInfo(userId)
    const plan = getPlan(user.planId, user.id)

    return `${total}/${plan?.maxLinks??0}`
  }

  deleteLinkByPage(pageId: string, userId: number) {
    return this.repo.delete({
      pageId,
      userId
    });
  }

  deleteLinkByTiktok(tiktokId: number, userId: number) {
    return this.repo.delete({
      tiktokId,
      userId
    });
  }

  async regetCmt(id: number) {
    return await this.repo
      .createQueryBuilder()
      .update()
      .set({
        isGetOldCmt: false,
      })
      .where('id = :id', { id })
      .execute();

  }

  deleteIds(ids: number[]) {
    return this.repo.delete(ids)
  }

  getByPostId(postId: string, userId: number) {
    return this.repo.findOne({
      where: {
        postId,
        userId,
      },
    });
  }

  async insertLinkPublic(
    roomId: string,
    tiktokId: number,
    nickname: string,
    userId: number,
  ) {
    try {
      // Check if link already exists
      const existingLink = await this.getByPostId(
        roomId,
        userId,
      );

      if (existingLink) {
        return existingLink;
      }

      // Create new link record
      const link = {
        linkUrl: `https://www.tiktok.com/@${nickname}`,
        linkName: '',
        content: '',
        postId: roomId,
        type: LinkType.PUBLIC,
        status: LinkStatus.Started,
        delayTime: 10,
        userId,
        isLinkGroup: false,
        process: true,
        tiktokId: tiktokId,
        platform: EPlatform.TIKTOK,
      };

      const savedLink = await this.repo.save(link);
      return savedLink;
    } catch (error) {
      return null;
    }
  }


  getOrder(userId: number) {
    return this.connection.query(`
        SELECT
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
    WHERE l.user_id = ${userId}
      AND c.order_status = 'success'
    GROUP BY
        l.id,
        l.link_name,
        l.post_id,
        l.created_at
    ORDER BY l.created_at DESC;  
    `)
  }
}
