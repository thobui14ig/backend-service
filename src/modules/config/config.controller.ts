import { Controller, Get, Param, ParseIntPipe, Put, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { getUser } from '../../common/utils/user';
import { Role, Roles } from '../../common/decorators/roles.decorator';
import { ConfigurationService } from './config.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller()
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get('config')
  getConfig(@Req() request: Request) {
    const user = getUser(request);
    return this.configurationService.getConfig(user.id);
  }

  @Get('config/users')
  @Roles(Role.ADMIN)
  getConfigsForUsers() {
    return this.configurationService.getConfigsForUsers();
  }

  @Get('config/:userId')
  @Roles(Role.ADMIN)
  getConfigForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.configurationService.getConfigForUser(userId);
  }

  @Put('config/:userId')
  @Roles(Role.ADMIN)
  updateConfigForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() input: UpdateConfigDto,
  ) {
    return this.configurationService.updateConfigForUser(userId, input);
  }
}
