import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { getUser } from '../../../../common/utils/user';
import { LEVEL } from '../../../user/entities/user.entity';
import { IGetCommentParams } from '../../comments.service.i';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { GetCommentUseCase } from '../../application/use-cases/get-comment.use-case';
import { SearchCommentsUseCase } from '../../application/use-cases/search-comments.use-case';
import { UpdateCommentUseCase } from '../../application/use-cases/update-comment.use-case';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly searchComments: SearchCommentsUseCase,
    private readonly getComment: GetCommentUseCase,
    private readonly updateComment: UpdateCommentUseCase,
  ) {}

  @Post()
  findAll(@Req() req: Request, @Body() body: IGetCommentParams) {
    const user = getUser(req);
    return this.searchComments.execute(
      { id: user.id, isAdmin: user.level === LEVEL.ADMIN },
      body,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getComment.execute(+id);
  }

  @Put()
  updateStatus(@Body() body: UpdateCommentDto, @Req() req: Request) {
    const user = getUser(req);
    return this.updateComment.updateDetails(body, user.id)
  }

  @Put('update-status')
  updateCommentStatus(@Body() body: Pick<UpdateCommentDto, 'id' | 'orderStatus'>, @Req() req: Request) {
    const user = getUser(req);
    return this.updateComment.updateOrderStatus(body, user.id)
  }
}
