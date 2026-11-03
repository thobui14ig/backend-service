import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { PageEntity } from '../entities/page.entity';

export const PAGE_PORT = Symbol('PAGE_PORT');

export interface PagePort {
  getPageCapacity(userId: number): Promise<{ count: number; maximum: number }>;
  create(input: CreatePageDto, userId: number): Promise<PageEntity>;
  findAll(
    ownerId: number | null,
    adminUserId: number | null,
  ): Promise<unknown[]>;
  findOne(id: number): Promise<PageEntity | null>;
  findOwned(id: number, userId: number): Promise<boolean>;
  update(id: number, input: UpdatePageDto): Promise<PageEntity>;
  delete(id: number): Promise<unknown>;
  deleteLinksByPage(pageId: string, userId: number): Promise<unknown>;
}
