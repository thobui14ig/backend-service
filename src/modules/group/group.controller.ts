import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
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
  findAll(@Req() req: Request, @Query('userId') userId?: string) {
    const user = getUser(req);
    if (userId === undefined) {
      return this.groupService.findAll(user);
    }

    const parsedUserId = Number(userId);
    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      throw new BadRequestException('userId không hợp lệ');
    }

    return this.groupService.findAll(user, parsedUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto, @Req() req: Request) {
    const user = getUser(req);
    return this.groupService.update(+id, dto, user.id, user.level);
  }

  @Delete(':id')
  remove(@Param('id') id: string,  @Req() req: Request) {
    const user = getUser(req);
    return this.groupService.remove(+id, user.id, user.level);
  }
}
