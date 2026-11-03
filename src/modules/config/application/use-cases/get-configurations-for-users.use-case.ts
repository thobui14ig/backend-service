import { Inject, Injectable } from '@nestjs/common';
import {
  CONFIGURATION_PORT,
  ConfigurationPort,
} from '../configuration.port';

@Injectable()
export class GetConfigurationsForUsersUseCase {
  constructor(
    @Inject(CONFIGURATION_PORT)
    private readonly configurations: ConfigurationPort,
  ) {}

  execute() {
    return this.configurations.getConfigurationsForUsers();
  }
}
