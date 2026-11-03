import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseFilters,
} from '@nestjs/common';
import { Request } from 'express';
import { getUser } from '../../../../common/utils/user';
import { Role, Roles } from '../../../../common/decorators/roles.decorator';
import { GetConfigurationUseCase } from '../../application/use-cases/get-configuration.use-case';
import { GetConfigurationsForUsersUseCase } from '../../application/use-cases/get-configurations-for-users.use-case';
import { GetUserConfigurationUseCase } from '../../application/use-cases/get-user-configuration.use-case';
import { UpdateUserConfigurationUseCase } from '../../application/use-cases/update-user-configuration.use-case';
import { ConfigurationExceptionFilter } from '../configuration-exception.filter';
import { UpdateConfigDto } from '../../dto/update-config.dto';

@Controller()
@UseFilters(ConfigurationExceptionFilter)
export class ConfigurationController {
  constructor(
    private readonly getConfiguration: GetConfigurationUseCase,
    private readonly getConfigurationsForUsers: GetConfigurationsForUsersUseCase,
    private readonly getUserConfiguration: GetUserConfigurationUseCase,
    private readonly updateUserConfiguration: UpdateUserConfigurationUseCase,
  ) {}

  @Get('config')
  getConfig(@Req() request: Request) {
    const user = getUser(request);
    return this.getConfiguration.execute(user.id);
  }

  @Get('config/users')
  @Roles(Role.ADMIN)
  getConfigsForUsers() {
    return this.getConfigurationsForUsers.execute();
  }

  @Get('config/:userId')
  @Roles(Role.ADMIN)
  getConfigForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.getUserConfiguration.execute(userId);
  }

  @Put('config/:userId')
  @Roles(Role.ADMIN)
  updateConfigForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() input: UpdateConfigDto,
  ) {
    return this.updateUserConfiguration.execute(userId, input);
  }
}
