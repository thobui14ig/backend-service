import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LinkCreationPort } from '../application/link-creation.port';
import { LinkEntity } from '../entities/links.entity';

@Injectable()
export class TypeOrmLinkCreationAdapter implements LinkCreationPort {
  constructor(
    @InjectRepository(LinkEntity)
    private readonly repository: Repository<LinkEntity>,
  ) {}

  async findExistingUrls(userId: number, urls: string[]): Promise<string[]> {
    if (urls.length === 0) return [];
    const existing = await this.repository.find({
      where: { userId, linkUrl: In(urls) },
      select: { linkUrl: true },
    });
    return existing.map((link) => link.linkUrl);
  }

  saveMany(links: Partial<LinkEntity>[]) {
    return this.repository.save(links);
  }
}
