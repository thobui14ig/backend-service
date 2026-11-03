import { UserNotFoundError } from '../configuration.errors';
import { ConfigurationPort } from '../configuration.port';
import { UpdateUserConfigurationUseCase } from './update-user-configuration.use-case';

describe('UpdateUserConfigurationUseCase', () => {
  const input = {
    excelId: 1,
    linkId: 0,
    isOrder: true,
    isConvertUid: false,
  };

  it('updates reseller and active sub-user configurations together', async () => {
    const configurations: ConfigurationPort = {
      getConfig: jest.fn(),
      getConfigurationsForUsers: jest.fn(),
      findActiveUser: jest.fn().mockResolvedValue({ id: 8, role: 'reseller' }),
      saveConfigurations: jest.fn().mockResolvedValue({ userId: '8' }),
    };
    const useCase = new UpdateUserConfigurationUseCase(configurations);

    await useCase.execute(8, input);

    expect(configurations.saveConfigurations).toHaveBeenCalledWith(
      8,
      true,
      input,
    );
  });

  it('does not propagate an ordinary user configuration', async () => {
    const configurations: ConfigurationPort = {
      getConfig: jest.fn(),
      getConfigurationsForUsers: jest.fn(),
      findActiveUser: jest.fn().mockResolvedValue({ id: 8, role: 'other' }),
      saveConfigurations: jest.fn().mockResolvedValue({ userId: '8' }),
    };
    const useCase = new UpdateUserConfigurationUseCase(configurations);

    await useCase.execute(8, input);

    expect(configurations.saveConfigurations).toHaveBeenCalledWith(
      8,
      false,
      input,
    );
  });

  it('fails when the target user is missing', async () => {
    const configurations: ConfigurationPort = {
      getConfig: jest.fn(),
      getConfigurationsForUsers: jest.fn(),
      findActiveUser: jest.fn().mockResolvedValue(null),
      saveConfigurations: jest.fn(),
    };
    const useCase = new UpdateUserConfigurationUseCase(configurations);

    await expect(useCase.execute(8, input)).rejects.toBeInstanceOf(
      UserNotFoundError,
    );
    expect(configurations.saveConfigurations).not.toHaveBeenCalled();
  });
});
