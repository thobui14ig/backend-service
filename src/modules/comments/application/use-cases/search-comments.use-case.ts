import { Inject, Injectable } from '@nestjs/common';
import { COMMENTS_PORT, CommentsPort } from '../comments.port';
import { IGetCommentParams } from '../../comments.service.i';

@Injectable()
export class SearchCommentsUseCase {
  constructor(
    @Inject(COMMENTS_PORT) private readonly comments: CommentsPort,
  ) {}

  execute(
    user: { id: number; isAdmin: boolean },
    params: IGetCommentParams,
  ) {
    return this.comments.search({
      userId: user.isAdmin ? null : user.id,
      params,
    });
  }
}
