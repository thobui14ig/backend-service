import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { CreateGroupFacebookDto } from './dto/create-group-facebook.dto';
import { UpdateGroupFacebookDto } from './dto/update-group-facebook.dto';
import { GroupFacebooService } from './group-facebook.service';
import { getUser } from 'src/common/utils/user';
import { Request } from 'express';

@Controller('group-facebook')
export class GroupFacebookController {
  constructor(private readonly groupFacebooService: GroupFacebooService) { }

  @Post()
  create(@Body() dto: CreateGroupFacebookDto, @Req() req: Request) {
    const user = getUser(req);
    return this.groupFacebooService.create(dto, user.id);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = getUser(req);
    return this.groupFacebooService.findAll(user.id, user.level);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupFacebooService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroupFacebookDto) {
    return this.groupFacebooService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupFacebooService.remove(+id);
  }
}
