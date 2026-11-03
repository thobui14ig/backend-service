import { Module } from '@nestjs/common';
import { CommentsController } from './presentation/http/comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity';
import { CookieEntity } from '../cookie/entities/cookie.entity';
import { FacebookModule } from '../facebook/facebook.module';
import { HttpModule } from '@nestjs/axios';
import { LinkModule } from '../links/links.module';
import { COMMENTS_PORT } from './application/comments.port';
import { GetCommentUseCase } from './application/use-cases/get-comment.use-case';
import { SearchCommentsUseCase } from './application/use-cases/search-comments.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { TypeOrmCommentsAdapter } from './infrastructure/typeorm-comments.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity]), FacebookModule, HttpModule, LinkModule],
  controllers: [CommentsController],
  providers: [
    GetCommentUseCase,
    SearchCommentsUseCase,
    UpdateCommentUseCase,
    TypeOrmCommentsAdapter,
    { provide: COMMENTS_PORT, useExisting: TypeOrmCommentsAdapter },
  ],
})
export class CommentsModule { }
