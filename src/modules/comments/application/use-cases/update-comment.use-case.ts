import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { COMMENTS_PORT, CommentsPort } from '../comments.port';
import { UpdateCommentDto } from '../../dto/update-comment.dto';

@Injectable()
export class UpdateCommentUseCase {
  constructor(
    @Inject(COMMENTS_PORT) private readonly comments: CommentsPort,
  ) {}

  async updateDetails(input: UpdateCommentDto, userId: number) {
    const updated = await this.comments.updateForOwnedLink(input.id, userId, {
      orderStatus: input.orderStatus,
      address: input.address,
      note: input.note,
    });
    if (updated === null) this.forbidden();
    return updated;
  }

  async updateOrderStatus(
    input: Pick<UpdateCommentDto, 'id' | 'orderStatus'>,
    userId: number,
  ) {
    const updated = await this.comments.updateOrderStatusForOwnedLink(
      input.id,
      userId,
      input.orderStatus,
    );
    if (updated === null) this.forbidden();
    return updated;
  }

  private forbidden(): never {
    throw new ForbiddenException('Bạn không có quyền cập nhật link này');
  }
}
