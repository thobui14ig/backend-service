import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { getUser } from 'src/common/utils/user';
import { CheckVipInterceptor } from './interceptors/check-vip';
import { UpdateUserTiktokDto } from './dto/update-user-tiktok.dto';
import { CreateUserTiktokDto } from './dto/create-user-tiktok.dto';
import { UserTiktokService } from './user-tiktok.service';
import { Public } from 'src/common/guard/guard';

@Controller('tiktok-users')
export class UserTiktokController {
  constructor(private readonly userTiktokService: UserTiktokService) { }

  @Post()
  create(@Body() dto: CreateUserTiktokDto, @Req() req: Request,) {
    const user = getUser(req);
    return this.userTiktokService.create(dto, user.id);
  }

  @Get()
  findAll(@Req() req: Request,) {
    const user = getUser(req);
    return this.userTiktokService.findAll(user);
  }

  @Get('get-all-public/:id')
  @Public()
  findAllPublic(@Req() req: Request, @Param('id') id: string) {
    return this.userTiktokService.findAllPublic(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userTiktokService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(CheckVipInterceptor)
  update(@Param('id') id: string, @Body() dto: UpdateUserTiktokDto, @Req() req: Request) {
    const user = getUser(req);
    return this.userTiktokService.update(+id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string,  @Req() req: Request) {
    const user = getUser(req);
    return this.userTiktokService.remove(+id, user);
  }
}
