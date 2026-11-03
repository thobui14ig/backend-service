import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { getUser } from '../../../../common/utils/user';
import { CheckVipInterceptor } from '../../interceptors/check-vip';
import { UpdateUserTiktokDto } from '../../dto/update-user-tiktok.dto';
import { CreateUserTiktokDto } from '../../dto/create-user-tiktok.dto';
import { Public } from '../../../../common/guard/guard';
import {
  CreateUserTiktokUseCase,
  DeleteUserTiktokUseCase,
  GetUserTiktokUseCase,
  ListPublicUserTiktokUseCase,
  ListUserTiktokUseCase,
  UpdateUserTiktokUseCase,
} from '../../application/use-cases/manage-user-tiktok.use-cases';

@Controller('tiktok-users')
export class UserTiktokController {
  constructor(
    private readonly createUserTiktok: CreateUserTiktokUseCase,
    private readonly listUserTiktok: ListUserTiktokUseCase,
    private readonly listPublicUserTiktok: ListPublicUserTiktokUseCase,
    private readonly getUserTiktok: GetUserTiktokUseCase,
    private readonly updateUserTiktok: UpdateUserTiktokUseCase,
    private readonly deleteUserTiktok: DeleteUserTiktokUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateUserTiktokDto, @Req() req: Request,) {
    const user = getUser(req);
    return this.createUserTiktok.execute(dto, user.id);
  }

  @Get()
  findAll(@Req() req: Request,) {
    const user = getUser(req);
    return this.listUserTiktok.execute(user);
  }

  @Get('get-all-public/:id')
  @Public()
  findAllPublic(@Req() req: Request, @Param('id') id: string) {
    return this.listPublicUserTiktok.execute(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getUserTiktok.execute(+id);
  }

  @Patch(':id')
  @UseInterceptors(CheckVipInterceptor)
  update(@Param('id') id: string, @Body() dto: UpdateUserTiktokDto, @Req() req: Request) {
    const user = getUser(req);
    return this.updateUserTiktok.execute(+id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string,  @Req() req: Request) {
    const user = getUser(req);
    return this.deleteUserTiktok.execute(+id, user);
  }
}
