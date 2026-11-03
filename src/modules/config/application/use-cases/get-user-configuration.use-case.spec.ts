import { ConfigurationNotFoundError } from '../configuration.errors';
import { ConfigurationPort } from '../configuration.port';
import { GetUserConfigurationUseCase } from './get-user-configuration.use-case';

describe('GetUserConfigurationUseCase', () => {
  it('fails explicitly when no configuration exists', async () => {
    const configurations: ConfigurationPort = {
      getConfig: jest.fn().mockResolvedValue(null),
      getConfigurationsForUsers: jest.fn(),
      findActiveUser: jest.fn(),
      saveConfigurations: jest.fn(),
    };
    const useCase = new GetUserConfigurationUseCase(configurations);

    await expect(useCase.execute(8)).rejects.toBeInstanceOf(
      ConfigurationNotFoundError,
    );
  });
});
