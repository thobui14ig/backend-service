import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LINK_CREATION_PORT, LinkCreationPort } from '../link-creation.port';
import { CreateLinkParams } from '../../links.service.i';
import { EPlatform, LinkEntity, LinkType } from '../../entities/links.entity';
import { GetUserByIdUseCase } from '../../../user/application/use-cases/manage-users.use-cases';
import { GetUserLinkCountUseCase } from './manage-link.use-cases';

@Injectable()
export class CreateLinksUseCase {
  constructor(
    @Inject(LINK_CREATION_PORT)
    private readonly links: LinkCreationPort,
    private readonly getUserById: GetUserByIdUseCase,
    private readonly getUserLinkCount: GetUserLinkCountUseCase,
  ) {}

  async execute(params: CreateLinkParams): Promise<never> {
    const user = await this.getUserById.execute(params.userId);
    if (!user) throw new NotFoundException('User không tồn tại.');
    if (!user.planId) {
      throw new BadRequestException('Bạn chưa mua gói víp nào.');
    }

    const totalLinks =
      (await this.getUserLinkCount.execute(params.userId)) +
      params.links.length;
    if (totalLinks > user.totalLink) {
      throw new BadRequestException('Vượt quá số link gói đang mua');
    }

    const urls = params.links.map((link) => link.url);
    const existingUrls = new Set(
      await this.links.findExistingUrls(params.userId, urls),
    );
    const uniqueLinks = new Map<string, Partial<LinkEntity>>();

    for (const link of params.links) {
      if (existingUrls.has(link.url) || uniqueLinks.has(link.url)) continue;

      const delayTime = [19, 2, 22, 102].includes(params.userId)
        ? 1
        : params.userId === 104
          ? 2
          : 4;
      const isTiktok = params.platform === EPlatform.TIKTOK;
      uniqueLinks.set(link.url, {
        userId: params.userId,
        linkUrl: link.url,
        delayTime,
        status: params.status,
        linkName: link.name,
        groupId: params.groupId,
        platform: params.platform,
        ...(isTiktok
          ? {
              postId: this.extractTikTokVideoId(link.url),
              process: true,
              type: LinkType.PUBLIC,
            }
          : {}),
      });
    }

    const entities = [...uniqueLinks.values()];
    for (let index = 0; index < entities.length; index += 10) {
      await this.links.saveMany(entities.slice(index, index + 10));
    }

    throw new HttpException(
      `Thêm thành công ${entities.length} link`,
      HttpStatus.OK,
    );
  }

  private extractTikTokVideoId(url: string): string | null {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  }
}
