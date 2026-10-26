import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { getUser } from '../../common/utils/user';
import { ConfigurationService } from './config.service';

@Controller()
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get('config')
  getConfig(@Req() request: Request) {
    const user = getUser(request);
    return this.configurationService.getConfig(user.id);
  }
}
