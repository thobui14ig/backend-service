import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
import { getUser } from 'src/common/utils/user';
import { UpdateUserDto } from './dto/update-user.dto';
import { CheckLimitLinkUserInterceptor } from './interceptor/handle-check-limit-link-user.interceptor';
import { Role, Roles } from 'src/common/decorators/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('')
  @Roles(Role.ADMIN)
  getUsers() {
    return this.userService.getAll()
  }

  @Get('/info')
  getUserInfo(@Req() req: Request) {
    const user = getUser(req);

    return this.userService.getInfo(user.id)
  }

  @Get('/:id')
  getUser(@Param('id') id: number) {
    return this.userService.findById(id)
  }

  @Put()
  @Roles(Role.ADMIN)
  // @UseInterceptors(CheckLimitLinkUserInterceptor)
  updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto)
  }

  @Delete('/:id')
  @Roles(Role.ADMIN)
  deleteUser(@Param('id') id: number) {
    return this.userService.delete(id)
  }
}
