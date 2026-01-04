import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { getUser } from 'src/common/utils/user';
import { CommentsService } from './comments.service';
import { IGetCommentParams } from './comments.service.i';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post()
  findAll(@Req() req: Request, @Body() body: IGetCommentParams) {
    const user = getUser(req);
    return this.commentsService.findAll(user, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }
}
