import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { getUser } from 'src/common/utils/user';
import { CommentsService } from './comments.service';
import { IGetCommentParams } from './comments.service.i';
import { UpdateCommentDto } from './dto/update-comment.dto';

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

  @Put()
  updateStatus(@Body() body: UpdateCommentDto, @Req() req: Request) {
    const user = getUser(req);
    return this.commentsService.updateStatus(body, user.id)
  }

  @Put('update-status')
  updateCommentStatus(@Body() body: Pick<UpdateCommentDto, 'id' | 'orderStatus'>, @Req() req: Request) {
    const user = getUser(req);
    return this.commentsService.updateCommentStatus(body, user.id)
  }
}
