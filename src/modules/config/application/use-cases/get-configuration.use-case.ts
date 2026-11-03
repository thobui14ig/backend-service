import { Inject, Injectable } from '@nestjs/common';
import {
  CONFIGURATION_PORT,
  ConfigurationPort,
} from '../configuration.port';

@Injectable()
export class GetConfigurationUseCase {
  constructor(
    @Inject(CONFIGURATION_PORT)
    private readonly configurations: ConfigurationPort,
  ) {}

  execute(userId: number) {
    return this.configurations.getConfig(userId);
  }
}
