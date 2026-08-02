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
        const delayTime = params.userId == 19 || params.userId == 2 || params.userId == 22 ? 1 : 4
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

  async getAll(body: BodyLinkQuery, level: LEVEL, userIdByUerLogin: number, isFilter: boolean, limit: number, offset: number, platform: EPlatform) {
    const { type, groupId, groupAutoId, timezone, pageId, userId, tiktokId } = body
    const currentDay = dayjs().tz(timezone)
    const startDate = currentDay.startOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
    const endDate = currentDay.endOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
    let queryEntends = ``
    const keyword = body.keyword?.length > 0 ? body.keyword?.trim() : null
    if (type) {
      queryEntends += ` AND l.type='${type}'`
    }
    if (level === LEVEL.USER) {
      queryEntends += ` AND l.user_id = ${userIdByUerLogin}`
    }

    if (groupId) {
      queryEntends += ` AND l.group_id = ${groupId} AND l.group_id IS NOT NULL`
    }

    if (groupAutoId) {
      queryEntends += ` AND l.group_auto_id = ${groupAutoId} AND l.group_auto_id IS NOT NULL`
    }

    if (pageId) {
      queryEntends += ` AND l.page_id = '${pageId}'`
    }

    if (userId) {
      queryEntends += ` AND l.user_id = '${userId}'`
    }

    if (tiktokId) {
      queryEntends += ` AND l.tiktok_id = ${tiktokId}`
    }

    if (platform) {
      queryEntends += ` AND l.platform = '${platform}'`
    }

    const query = `
      WITH filtered_links AS (
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
              l.group_id as "groupId",
              l.content,
              p.name as "pageName",
              g.name as "groupName",
              COUNT(c.id) AS "totalComment",
              COUNT(c.id) FILTER (
                WHERE c.created_at >= '${startDate}'
                AND c.created_at < '${endDate}'
              ) AS "totalCommentToDay",
               l.total_like as "totalLike",
               l.total_cmt as "totalCmt",
               l.thumbnail,
               l.is_get_old_comment as "isGetOldCmt"
          FROM links l
          JOIN users u ON u.id = l.user_id
          LEFT JOIN comments c ON c.link_id = l.id
          LEFT JOIN page p ON p.page_id = l.page_id and l.user_id=p.user_id
          LEFT JOIN group_link g ON l.group_id = g.id
          WHERE l.is_deleted = false and l.is_link_group = false ${queryEntends}
        ${keyword ? `AND (
            l.post_id::text ~* '${keyword}'
            OR l.link_name::text ~* '${keyword}'
            OR l.link_url::text ~* '${keyword}'
            OR l.status::text ~* '${keyword}'
            OR u.username::text ~* '${keyword}'
          )` : ""}
            GROUP BY
            l.id,
            l.link_name,
            l.link_url,
            l.post_id,
            l.delay_time,
            l.status,
            l.created_at,
            l.last_comment_time,
            u.username,
            l.type,
            l.group_id,
            l.content,
            l.is_get_old_comment,
            p.name,
            g.name
      )
      SELECT *, (SELECT COUNT(*) FROM filtered_links) AS "totalCount"
      FROM filtered_links
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${offset};

      `
    let response: any[] = await this.connection.query(query, [])

    return {
      data: response,
      totalCount: response.length > 0 ? response[0].totalCount : 0
    }
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
}
