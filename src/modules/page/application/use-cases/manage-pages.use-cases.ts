import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { LEVEL } from '../../../user/entities/user.entity';
import { PAGE_PORT, PagePort } from '../page.port';
import { CreatePageDto } from '../../dto/create-page.dto';
import { UpdatePageDto } from '../../dto/update-page.dto';

@Injectable()
export class CreatePageUseCase {
  constructor(@Inject(PAGE_PORT) private readonly pages: PagePort) {}

  async execute(input: CreatePageDto, userId: number) {
    const { count, maximum } = await this.pages.getPageCapacity(userId);
    if (count >= maximum) {
      throw new HttpException(
        `Tài khoản của bạn chỉ được thêm tối đa ${maximum} page`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.pages.create(input, userId);
  }
}

@Injectable()
export class ListPagesUseCase {
  constructor(@Inject(PAGE_PORT) private readonly pages: PagePort) {}

  execute(
    user: { id?: number; level?: LEVEL },
    requestedUserId: number | null | undefined,
  ) {
    const ownerId = user.level === LEVEL.ADMIN ? null : user.id;
    const adminUserId =
      user.level === LEVEL.ADMIN ? requestedUserId || null : null;
    return this.pages.findAll(ownerId ?? null, adminUserId);
  }
}

@Injectable()
export class GetPageUseCase {
  constructor(@Inject(PAGE_PORT) private readonly pages: PagePort) {}

  execute(id: number) {
    return this.pages.findOne(id);
  }
}

@Injectable()
export class UpdatePageUseCase {
  constructor(@Inject(PAGE_PORT) private readonly pages: PagePort) {}

  async execute(id: number, input: UpdatePageDto, userId: number) {
    if (!(await this.pages.findOwned(id, userId))) {
      throw new ForbiddenException('Bạn không có quyền');
    }
    return this.pages.update(id, input);
  }
}

@Injectable()
export class DeletePageUseCase {
  constructor(@Inject(PAGE_PORT) private readonly pages: PagePort) {}

  async execute(
    id: number,
    user: { id?: number; level?: LEVEL },
  ) {
    const page = await this.pages.findOne(id);
    if (
      !page ||
      (user.level !== LEVEL.ADMIN && page.userId !== user.id)
    ) {
      throw new ForbiddenException('Bạn không có quyền');
    }
    await this.pages.deleteLinksByPage(page.pageId, user.id ?? page.userId);
    return this.pages.delete(id);
  }
}
