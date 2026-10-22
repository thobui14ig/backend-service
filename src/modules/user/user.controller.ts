import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
import { getUser } from 'src/common/utils/user';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/guard/guard';
import { Throttle } from '@nestjs/throttler';
import { LEVEL } from './entities/user.entity';

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

  @Post('sub-user')
  @Throttle({
    default: {
      limit: 1,
      ttl: 10_000,
    },
  })
  createSubUser(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const user = getUser(req);
    const input = {
      ...createUserDto,
      parentId: user.level == LEVEL.RESELLER ? user.id : undefined,
      totalLink: 100
    }
    return this.userService.create(input);
  }

  @Get('')
  @Roles(Role.ADMIN)
  getUsers() {
    return this.userService.getAll()
  }

  @Get('sub-users')
  getSubUsers(@Req() req: Request) {
    const user = getUser(req);
    return this.userService.getSubUsers(user.id)
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

  @Post('renew-service')
  renewService(@Body() dto: { userId: number }, @Req() req: Request) {
    const user = getUser(req);
    return this.userService.renewServiceForReseller(dto.userId, user.id);
  }

  @Post('renew-service-user')
  renewServiceForUser(@Req() req: Request) {
    const user = getUser(req);
    return this.userService.renewServiceForUser(user.id);
  }
}
