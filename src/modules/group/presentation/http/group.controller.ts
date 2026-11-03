import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { CreateGroupDto } from '../../dto/create-group.dto';
import { UpdateGroupDto } from '../../dto/update-group.dto';
import { getUser } from '../../../../common/utils/user';
import { Request } from 'express';
import {
  CreateGroupUseCase,
  DeleteGroupUseCase,
  GetGroupUseCase,
  ListGroupsUseCase,
  UpdateGroupUseCase,
} from '../../application/use-cases/manage-groups.use-cases';

@Controller('group')
export class GroupFacebookController {
  constructor(
    private readonly createGroup: CreateGroupUseCase,
    private readonly listGroups: ListGroupsUseCase,
    private readonly getGroup: GetGroupUseCase,
    private readonly updateGroup: UpdateGroupUseCase,
    private readonly deleteGroup: DeleteGroupUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateGroupDto, @Req() req: Request,) {
    const user = getUser(req);
    return this.createGroup.execute(dto, user.id);
  }

  @Get()
  findAll(@Req() req: Request, @Query('userId') userId?: string) {
    const user = getUser(req);
    return this.listGroups.execute(user, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getGroup.execute(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto, @Req() req: Request) {
    const user = getUser(req);
    return this.updateGroup.execute(+id, dto, user.id, user.level);
  }

  @Delete(':id')
  remove(@Param('id') id: string,  @Req() req: Request) {
    const user = getUser(req);
    return this.deleteGroup.execute(+id, user.id, user.level);
  }
}
