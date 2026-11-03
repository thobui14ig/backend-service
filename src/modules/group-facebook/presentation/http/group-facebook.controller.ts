import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { CreateGroupFacebookDto } from '../../dto/create-group-facebook.dto';
import { UpdateGroupFacebookDto } from '../../dto/update-group-facebook.dto';
import { getUser } from '../../../../common/utils/user';
import { Request } from 'express';
import {
  CreateGroupFacebookUseCase,
  DeleteGroupFacebookUseCase,
  GetGroupFacebookUseCase,
  ListGroupFacebookUseCase,
  UpdateGroupFacebookUseCase,
} from '../../application/use-cases/manage-group-facebook.use-cases';

@Controller('group-facebook')
export class GroupFacebookController {
  constructor(
    private readonly createGroup: CreateGroupFacebookUseCase,
    private readonly listGroups: ListGroupFacebookUseCase,
    private readonly getGroup: GetGroupFacebookUseCase,
    private readonly updateGroup: UpdateGroupFacebookUseCase,
    private readonly deleteGroup: DeleteGroupFacebookUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateGroupFacebookDto, @Req() req: Request) {
    const user = getUser(req);
    return this.createGroup.execute(dto, user.id);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = getUser(req);
    return this.listGroups.execute(user.id, user.level);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getGroup.execute(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroupFacebookDto) {
    return this.updateGroup.execute(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteGroup.execute(+id);
  }
}
