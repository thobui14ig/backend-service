import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LEVEL } from '../../../user/entities/user.entity';
import { UpdateLinkDTO } from '../../dto/update-link.dto';
import {
  EPlatform,
  LinkStatus,
  LinkType,
} from '../../entities/links.entity';
import { CreatePublicLinkInput } from '../link-mutation.types';
import { LINK_MUTATION_PORT, LinkMutationPort } from '../link-mutation.port';

@Injectable()
export class UpdateLinkUseCase {
  constructor(
    @Inject(LINK_MUTATION_PORT)
    private readonly links: LinkMutationPort,
  ) {}

  execute(input: UpdateLinkDTO, level: LEVEL, userId: number) {
    return this.links.transaction(async (transaction) => {
      const link = await transaction.findForUpdate(input.id);
      if (!link) throw new NotFoundException('Link không tồn tại');

      if (level !== LEVEL.ADMIN && link.userId !== userId) {
        throw new ForbiddenException('Bạn không có quyền cập nhật link này');
      }

      link.linkName = input.linkName;
      link.groupId = input.groupId;
      if (level === LEVEL.ADMIN) {
        link.delayTime = input.delayTime;
        link.type = input.type;
      }
      return transaction.save(link);
    });
  }
}

@Injectable()
export class DeleteLinkUseCase {
  constructor(
    @Inject(LINK_MUTATION_PORT)
    private readonly links: LinkMutationPort,
  ) {}

  execute(id: number, level: LEVEL, userId: number) {
    return this.links.transaction(async (transaction) => {
      const link = await transaction.findForUpdate(id);
      if (!link) throw new NotFoundException('Link không tồn tại');

      if (level !== LEVEL.ADMIN && link.userId !== userId) {
        throw new ForbiddenException('Bạn không có quyền xoá link này');
      }

      return transaction.delete(id);
    });
  }
}

@Injectable()
export class GetLinkByIdUseCase {
  constructor(
    @Inject(LINK_MUTATION_PORT)
    private readonly links: LinkMutationPort,
  ) {}

  execute(id: number) {
    return this.links.getById(id);
  }
}

@Injectable()
export class RefetchLinkCommentsUseCase {
  constructor(
    @Inject(LINK_MUTATION_PORT)
    private readonly links: LinkMutationPort,
  ) {}

  execute(id: number) {
    return this.links.markCommentsForRefetch(id);
  }
}

@Injectable()
export class DeleteLinksUseCase {
  constructor(
    @Inject(LINK_MUTATION_PORT)
    private readonly links: LinkMutationPort,
  ) {}

  execute(ids: number[]) {
    return this.links.deleteMany(ids);
  }
}

@Injectable()
export class CreatePublicTiktokLinkUseCase {
  constructor(
    @Inject(LINK_MUTATION_PORT)
    private readonly links: LinkMutationPort,
  ) {}

  async execute(input: CreatePublicLinkInput) {
    const existing = await this.links.findByPostId(input.roomId, input.userId);
    if (existing) return existing;

    return this.links.savePublicLink({
      linkUrl: `https://www.tiktok.com/@${input.nickname}`,
      linkName: '',
      content: '',
      postId: input.roomId,
      type: LinkType.PUBLIC,
      status: LinkStatus.Started,
      delayTime: 10,
      userId: input.userId,
      process: true,
      tiktokId: input.tiktokId,
      platform: EPlatform.TIKTOK,
    });
  }
}

@Injectable()
export class GetUserLinkCountUseCase {
  constructor(
    @Inject(LINK_MUTATION_PORT)
    private readonly links: LinkMutationPort,
  ) {}

  execute(userId: number) {
    return this.links.countByUser(userId);
  }
}

@Injectable()
export class GetUserLinkCountAfterStatusChangeUseCase {
  constructor(
    @Inject(LINK_MUTATION_PORT)
    private readonly links: LinkMutationPort,
  ) {}

  execute(userId: number, status: LinkStatus, linkIds: number[]) {
    return this.links.countByUserAfterStatusChange(userId, status, linkIds);
  }
}

@Injectable()
export class DeleteLinksByPageUseCase {
  constructor(
    @Inject(LINK_MUTATION_PORT)
    private readonly links: LinkMutationPort,
  ) {}

  execute(pageId: string, userId: number) {
    return this.links.deleteByPage(pageId, userId);
  }
}

@Injectable()
export class DeleteLinksByTiktokUseCase {
  constructor(
    @Inject(LINK_MUTATION_PORT)
    private readonly links: LinkMutationPort,
  ) {}

  execute(tiktokId: number, userId: number) {
    return this.links.deleteByTiktok(tiktokId, userId);
  }
}
