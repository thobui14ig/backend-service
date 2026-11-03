import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeleteLinksByTiktokUseCase } from '../../links/application/use-cases/manage-link.use-cases';
import { GetUserInfoUseCase } from '../../user/application/use-cases/manage-users.use-cases';
import { UserTiktokPort } from '../application/user-tiktok.port';
import { CreateUserTiktokDto } from '../dto/create-user-tiktok.dto';
import { UpdateUserTiktokDto } from '../dto/update-user-tiktok.dto';
import { UserTiktokEntity } from '../entities/page.entity';

@Injectable()
export class TypeOrmUserTiktokAdapter implements UserTiktokPort {
  constructor(
    @InjectRepository(UserTiktokEntity)
    private readonly repository: Repository<UserTiktokEntity>,
    private readonly dataSource: DataSource,
    private readonly getUserInfo: GetUserInfoUseCase,
    private readonly deleteTiktokLinksUseCase: DeleteLinksByTiktokUseCase,
  ) {}

  async getCapacity(userId: number) {
    const [count, user] = await Promise.all([
      this.repository.count({ where: { userId } }),
      this.getUserInfo.execute(userId),
    ]);
    return { count, planId: user.planId, ownerId: user.id };
  }

  create(input: CreateUserTiktokDto, userId: number) {
    return this.repository.save({ ...input, userId });
  }

  findAll(ownerId: number | null) {
    const where = ownerId === null ? '' : 'WHERE tu.user_id = $1';
    const linkFilter = ownerId === null ? '' : 'AND l.user_id = $1';
    const values = ownerId === null ? [] : [ownerId];
    return this.dataSource.query(
      `SELECT
        tu.id,
        tu.user_id AS "userId",
        tu.nickname,
        tu.name,
        COUNT(l.id) AS "totalLink"
      FROM tiktok_users tu
      LEFT JOIN users u ON u.id = tu.user_id
      LEFT JOIN links l ON l.tiktok_id = tu.id
        AND l.user_id = tu.user_id ${linkFilter}
      ${where}
      GROUP BY tu.id, u.username
      ORDER BY tu.id DESC`,
      values,
    );
  }

  findAllPublic(userId: number) {
    return this.repository.find({
      where: { userId },
      order: { id: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  async findOwned(id: number, userId: number) {
    return Boolean(
      await this.repository.findOne({ where: { id, userId } }),
    );
  }

  update(id: number, input: UpdateUserTiktokDto) {
    return this.repository.save({ id, ...input });
  }

  delete(id: number) {
    return this.repository.delete(id);
  }

  deleteLinks(tiktokId: number, userId: number) {
    return this.deleteTiktokLinksUseCase.execute(tiktokId, userId);
  }
}
