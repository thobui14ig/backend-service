import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { getUser } from 'src/common/utils/user';
import { CreatePageDto } from './dto/create-page.dto';
import { PageService } from './page.service';
import { UpdatePageDto } from './dto/update-page.dto';
import { CheckVipInterceptor } from './interceptors/check-vip';

@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) { }

  @Post()
  create(@Body() dto: CreatePageDto, @Req() req: Request,) {
    const user = getUser(req);
    return this.pageService.create(dto, user.id);
  }

  @Get()
  findAll(@Req() req: Request,) {
    const user = getUser(req);
    return this.pageService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pageService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(CheckVipInterceptor)
  update(@Param('id') id: string, @Body() dto: UpdatePageDto, @Req() req: Request) {
    const user = getUser(req);
    return this.pageService.update(+id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string,  @Req() req: Request) {
    const user = getUser(req);
    return this.pageService.remove(+id, user.id);
  }
}
