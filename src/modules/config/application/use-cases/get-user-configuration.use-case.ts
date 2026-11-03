import { Inject, Injectable } from '@nestjs/common';
import { ConfigurationNotFoundError } from '../configuration.errors';
import {
  CONFIGURATION_PORT,
  ConfigurationPort,
} from '../configuration.port';

@Injectable()
export class GetUserConfigurationUseCase {
  constructor(
    @Inject(CONFIGURATION_PORT)
    private readonly configurations: ConfigurationPort,
  ) {}

  async execute(userId: number) {
    const config = await this.configurations.getConfig(userId);
    if (!config) {
      throw new ConfigurationNotFoundError();
    }

    return config;
  }
}
