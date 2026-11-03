import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { getUser } from 'src/common/utils/user';
import { CreateLinkDTO } from './dto/create-link.dto';
import { UpdateLinkDTO } from './dto/update-link.dto';
import { CreateLinksUseCase } from './application/use-cases/create-links.use-case';
import { GetLinkOrdersUseCase } from './application/use-cases/get-link-orders.use-case';
import { GetLinkSummaryUseCase } from './application/use-cases/get-link-summary.use-case';
import { GetLinksUseCase } from './application/use-cases/get-links.use-case';
import { BodyLinkQuery } from './links.service.i';
import { EPlatform } from './entities/links.entity';
import { Public } from 'src/common/guard/guard';
import {
  CreatePublicTiktokLinkUseCase,
  DeleteLinkUseCase,
  DeleteLinksUseCase,
  GetLinkByIdUseCase,
  RefetchLinkCommentsUseCase,
  UpdateLinkUseCase,
} from './application/use-cases/manage-link.use-cases';

@Controller('links')
export class LinkController {
  constructor(
    private readonly createLinks: CreateLinksUseCase,
    private readonly getLinkOrders: GetLinkOrdersUseCase,
    private readonly getLinkSummary: GetLinkSummaryUseCase,
    private readonly getLinksUseCase: GetLinksUseCase,
    private readonly updateLinkUseCase: UpdateLinkUseCase,
    private readonly deleteLinkUseCase: DeleteLinkUseCase,
    private readonly getLinkByIdUseCase: GetLinkByIdUseCase,
    private readonly refetchLinkCommentsUseCase: RefetchLinkCommentsUseCase,
    private readonly deleteLinksUseCase: DeleteLinksUseCase,
    private readonly createPublicTiktokLinkUseCase: CreatePublicTiktokLinkUseCase,
  ) { }


  @Get('/get-order')
  getOrder(@Req() req: Request,) {
    const user = getUser(req);
    return this.getLinkOrders.execute(user.id);
  }

  @Post()
  create(@Req() req: Request, @Body() createLinkDto: CreateLinkDTO) {
    const user = getUser(req);

    return this.createLinks.execute({
      ...createLinkDto,
      userId: user.id,
    });
  }

  @Get('get-total-link')
  getTotalLink(@Req() req: Request) {
    const user = getUser(req);
    return this.getLinkSummary.execute(user.id)
  }

  @Get('/:id')
  getUser(@Param('id') id: number) {
    return this.getLinkByIdUseCase.execute(id);
  }

  @Post('/query')
  getLinks(@Req() req: Request, @Body() body: BodyLinkQuery, @Query('limit') limit: number, @Query('offset') offset: number, @Query('platform') platform: EPlatform) {
    const user = getUser(req);

    return this.getLinksUseCase.execute(
      body,
      user.level,
      user.id,
      limit,
      offset,
      platform,
    );
  }

  @Put()
  updateLink(@Req() req: Request, @Body() updateLinkDto: UpdateLinkDTO) {
    const user = getUser(req);
    return this.updateLinkUseCase.execute(updateLinkDto, user.level, user.id);
  }

  @Delete('/:id')
  deleteLink(@Param('id') id: number, @Req() req: Request,) {
    const user = getUser(req);
    return this.deleteLinkUseCase.execute(id, user.level, user.id);
  }

  @Get('/reget-cmt/:id')
  regetCmt(@Param('id') id: number) {
    return this.refetchLinkCommentsUseCase.execute(id);
  }

  @Post('delete-ids')
  deleteIds(@Body() body: { ids: number[] }) {
    return this.deleteLinksUseCase.execute(body.ids)
  }

  @Post('insert-link-public')
  @Public()
  insertLinkPublic(@Req() req: Request, @Body() body: {
    roomId: string,
    tiktokId: number,
    nickname: string,
    userId: number,
  }) {
    return this.createPublicTiktokLinkUseCase.execute(body);
  }

}
