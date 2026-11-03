import { UserEntity } from '../../user/entities/user.entity';
import { IGetCommentParams } from '../comments.service.i';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentEntity } from '../entities/comment.entity';

export const COMMENTS_PORT = Symbol('COMMENTS_PORT');

export interface CommentSearch {
  userId: number | null;
  params: IGetCommentParams;
}

export interface CommentsPort {
  search(input: CommentSearch): Promise<{ data: unknown[]; totalCount: number }>;
  findOne(id: number): Promise<CommentEntity | null>;
  updateForOwnedLink(
    commentId: number,
    userId: number,
    update: Pick<UpdateCommentDto, 'orderStatus' | 'address' | 'note'>,
  ): Promise<unknown>;
  updateOrderStatusForOwnedLink(
    commentId: number,
    userId: number,
    orderStatus: UpdateCommentDto['orderStatus'],
  ): Promise<unknown>;
}
