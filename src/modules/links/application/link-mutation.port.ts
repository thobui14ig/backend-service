import { LinkEntity } from '../entities/links.entity';
import { LinkStatus } from '../entities/links.entity';

export const LINK_MUTATION_PORT = Symbol('LINK_MUTATION_PORT');

export interface LinkMutationTransactionPort {
  findForUpdate(id: number): Promise<LinkEntity | null>;
  save(link: LinkEntity): Promise<LinkEntity>;
  delete(id: number): Promise<unknown>;
}

export interface LinkMutationPort {
  transaction<T>(
    work: (transaction: LinkMutationTransactionPort) => Promise<T>,
  ): Promise<T>;
  getById(id: number): Promise<LinkEntity | null>;
  markCommentsForRefetch(id: number): Promise<unknown>;
  deleteMany(ids: number[]): Promise<unknown>;
  findByPostId(postId: string, userId: number): Promise<LinkEntity | null>;
  savePublicLink(link: Partial<LinkEntity>): Promise<LinkEntity>;
  countByUser(userId: number): Promise<number>;
  countByUserAfterStatusChange(
    userId: number,
    status: LinkStatus,
    linkIds: number[],
  ): Promise<number>;
  deleteByPage(pageId: string, userId: number): Promise<unknown>;
  deleteByTiktok(tiktokId: number, userId: number): Promise<unknown>;
}
