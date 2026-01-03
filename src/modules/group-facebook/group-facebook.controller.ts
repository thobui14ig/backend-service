import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateGroupFacebookDto } from './dto/create-group-facebook.dto';
import { UpdateGroupFacebookDto } from './dto/update-group-facebook.dto';
import { IGetProxy } from './group-facebook.controller.i';
import { GroupFacebooService } from './group-facebook.service';

@Controller('group-facebook')
export class GroupFacebookController {
  constructor(private readonly groupFacebooService: GroupFacebooService) { }

  @Post()
  create(@Body() dto: CreateGroupFacebookDto) {
    return this.groupFacebooService.create(dto);
  }

  @Get()
  findAll() {
    return this.groupFacebooService.findAll();
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
