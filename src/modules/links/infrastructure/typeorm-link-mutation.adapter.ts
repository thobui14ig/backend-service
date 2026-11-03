import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { LinkMutationPort, LinkMutationTransactionPort } from '../application/link-mutation.port';
import { LinkEntity, LinkStatus } from '../entities/links.entity';

@Injectable()
export class TypeOrmLinkMutationAdapter implements LinkMutationPort {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(LinkEntity)
    private readonly repository: Repository<LinkEntity>,
  ) {}

  transaction<T>(
    work: (transaction: LinkMutationTransactionPort) => Promise<T>,
  ) {
    return this.dataSource.transaction((manager) => work(this.createTransaction(manager)));
  }

  private createTransaction(manager: EntityManager): LinkMutationTransactionPort {
    const repository = manager.getRepository(LinkEntity);

    return {
      findForUpdate: (id) =>
        repository
          .createQueryBuilder('link')
          .setLock('pessimistic_write')
          .where('link.id = :id', { id })
          .getOne(),
      save: (link) => repository.save(link),
      delete: (id) => repository.delete(id),
    };
  }

  getById(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  markCommentsForRefetch(id: number) {
    return this.repository
      .createQueryBuilder()
      .update()
      .set({ isGetOldCmt: false })
      .where('id = :id', { id })
      .execute();
  }

  deleteMany(ids: number[]) {
    return this.repository.delete(ids);
  }

  findByPostId(postId: string, userId: number) {
    return this.repository.findOne({ where: { postId, userId } });
  }

  savePublicLink(link: Partial<LinkEntity>) {
    return this.repository.save(link);
  }

  countByUser(userId: number) {
    return this.repository.countBy({ userId, isDelete: false });
  }

  async countByUserAfterStatusChange(
    userId: number,
    status: LinkStatus,
    linkIds: number[],
  ) {
    const [total, affected] = await Promise.all([
      this.countByUser(userId),
      this.repository.countBy({
        userId,
        status: status === LinkStatus.Pending
          ? LinkStatus.Started
          : LinkStatus.Pending,
        id: In(linkIds),
        isDelete: false,
      }),
    ]);
    return total + affected;
  }

  deleteByPage(pageId: string, userId: number) {
    return this.repository.delete({ pageId, userId });
  }

  deleteByTiktok(tiktokId: number, userId: number) {
    return this.repository.delete({ tiktokId, userId });
  }
}
