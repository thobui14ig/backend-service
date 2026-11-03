import { LinkEntity } from '../entities/links.entity';

export const LINK_CREATION_PORT = Symbol('LINK_CREATION_PORT');

export interface LinkCreationPort {
  findExistingUrls(userId: number, urls: string[]): Promise<string[]>;
  saveMany(links: Partial<LinkEntity>[]): Promise<unknown>;
}
