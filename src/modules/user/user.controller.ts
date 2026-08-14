import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
import { getUser } from 'src/common/utils/user';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/guard/guard';
import { Throttle } from '@nestjs/throttler';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @Public()
  @Throttle({
    default: {
      limit: 1,
      ttl: 10_000,
    },
  })
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
  updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto)
  }

  @Delete('/:id')
  @Roles(Role.ADMIN)
  deleteUser(@Param('id') id: number) {
    return this.userService.delete(id)
  }

  @Post('change-pass')
  changePass(@Body() dto: { password: string }, @Req() req: Request) {
    const user = getUser(req);
    return this.userService.changePass(dto, user.id);
  }
}
