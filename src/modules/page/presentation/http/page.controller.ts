import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { getUser } from '../../../../common/utils/user';
import { CreatePageDto } from '../../dto/create-page.dto';
import { UpdatePageDto } from '../../dto/update-page.dto';
import { CheckVipInterceptor } from '../../interceptors/check-vip';
import {
  CreatePageUseCase,
  DeletePageUseCase,
  GetPageUseCase,
  ListPagesUseCase,
  UpdatePageUseCase,
} from '../../application/use-cases/manage-pages.use-cases';

@Controller('page')
export class PageController {
  constructor(
    private readonly createPage: CreatePageUseCase,
    private readonly listPages: ListPagesUseCase,
    private readonly getPage: GetPageUseCase,
    private readonly updatePage: UpdatePageUseCase,
    private readonly deletePage: DeletePageUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreatePageDto, @Req() req: Request,) {
    const user = getUser(req);
    return this.createPage.execute(dto, user.id);
  }

  @Post('find-all')
  findAll(@Req() req: Request, @Body() body: { userId: null | undefined }) {
    const user = getUser(req);
    return this.listPages.execute(user, body.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getPage.execute(+id);
  }

  @Patch(':id')
  @UseInterceptors(CheckVipInterceptor)
  update(@Param('id') id: string, @Body() dto: UpdatePageDto, @Req() req: Request) {
    const user = getUser(req);
    return this.updatePage.execute(+id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string,  @Req() req: Request) {
    const user = getUser(req);
    return this.deletePage.execute(+id, user);
  }
}
