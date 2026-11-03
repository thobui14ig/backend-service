import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeleteLinksByPageUseCase } from '../../links/application/use-cases/manage-link.use-cases';
import { GetUserInfoUseCase } from '../../user/application/use-cases/manage-users.use-cases';
import { PagePort } from '../application/page.port';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { PageEntity } from '../entities/page.entity';

@Injectable()
export class TypeOrmPageAdapter implements PagePort {
  constructor(
    @InjectRepository(PageEntity)
    private readonly repository: Repository<PageEntity>,
    private readonly dataSource: DataSource,
    private readonly getUserInfo: GetUserInfoUseCase,
    private readonly deletePageLinksUseCase: DeleteLinksByPageUseCase,
  ) {}

  async getPageCapacity(userId: number) {
    const [count, user] = await Promise.all([
      this.repository.count({ where: { userId } }),
      this.getUserInfo.execute(userId),
    ]);
    return { count, maximum: user.maxPage };
  }

  create(input: CreatePageDto, userId: number) {
    return this.repository.save({ ...input, userId });
  }

  findAll(ownerId: number | null, adminUserId: number | null) {
    const parameters: number[] = [];
    const filters: string[] = [];
    if (ownerId !== null) {
      parameters.push(ownerId);
      filters.push(`p.user_id = $${parameters.length}`);
    }
    if (adminUserId !== null) {
      parameters.push(adminUserId);
      filters.push(`u.id = $${parameters.length}`);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const ownerLinkFilter = ownerId === null ? '' : `AND l.user_id = $1`;

    return this.dataSource.query(
      `SELECT
        p.id,
        p.user_id AS "userId",
        p.page_id AS "pageId",
        p.name,
        p.is_active AS "isActive",
        p.created_at::TEXT AS "createdAt",
        u.username AS "username",
        p.username AS "pagename",
        COUNT(l.id) AS "totalLink"
      FROM page p
      LEFT JOIN links l ON l.page_id = p.page_id
        AND l.user_id = p.user_id ${ownerLinkFilter}
      JOIN users u ON u.id = p.user_id
      ${where}
      GROUP BY p.id, u.username
      ORDER BY p.id DESC`,
      parameters,
    );
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  async findOwned(id: number, userId: number) {
    return Boolean(
      await this.repository.findOne({ where: { id, userId } }),
    );
  }

  update(id: number, input: UpdatePageDto) {
    return this.repository.save({ id, ...input });
  }

  delete(id: number) {
    return this.repository.delete(id);
  }

  deleteLinksByPage(pageId: string, userId: number) {
    return this.deletePageLinksUseCase.execute(pageId, userId);
  }
}
