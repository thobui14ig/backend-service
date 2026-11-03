import { Inject, Injectable } from '@nestjs/common';
import { COMMENTS_PORT, CommentsPort } from '../comments.port';

@Injectable()
export class GetCommentUseCase {
  constructor(
    @Inject(COMMENTS_PORT) private readonly comments: CommentsPort,
  ) {}

  execute(id: number) {
    return this.comments.findOne(id);
  }
}
