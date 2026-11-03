import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from '../configuration.errors';
import {
  CONFIGURATION_PORT,
  ConfigurationPort,
} from '../configuration.port';
import { UpdateConfigurationInput } from '../configuration.types';

@Injectable()
export class UpdateUserConfigurationUseCase {
  constructor(
    @Inject(CONFIGURATION_PORT)
    private readonly configurations: ConfigurationPort,
  ) {}

  async execute(userId: number, input: UpdateConfigurationInput) {
    const user = await this.configurations.findActiveUser(userId);
    if (!user) throw new UserNotFoundError();

    return this.configurations.saveConfigurations(
      userId,
      user.role === 'reseller',
      input,
    );
  }
}
