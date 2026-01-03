import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupService } from './group.service';
import { getUser } from 'src/common/utils/user';
import { Request } from 'express';

@Controller('group')
export class GroupFacebookController {
  constructor(private readonly groupService: GroupService) { }

  @Post()
  create(@Body() dto: CreateGroupDto, @Req() req: Request,) {
    const user = getUser(req);
    return this.groupService.create(dto, user.id);
  }

  @Get()
  findAll(@Req() req: Request,) {
    const user = getUser(req);
    return this.groupService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto, @Req() req: Request) {
    const user = getUser(req);
    return this.groupService.update(+id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string,  @Req() req: Request) {
    const user = getUser(req);
    return this.groupService.remove(+id, user.id);
  }
}
