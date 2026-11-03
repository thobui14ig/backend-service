import { UpdateConfigurationInput } from './configuration.types';

export const CONFIGURATION_PORT = Symbol('CONFIGURATION_PORT');

export interface ConfigUser {
  id: number;
  role: 'reseller' | 'other';
}

export interface ConfigurationRecord {
  userId: string;
  excelId: string | null;
  linkId: string | null;
  isOrder: boolean;
  isConvertUid: boolean;
}

export interface ConfigurationsForUsersRecord extends ConfigurationRecord {
  username: string;
  hasConfig: boolean;
}

export interface ConfigurationPort {
  getConfig(userId: number): Promise<ConfigurationRecord | null>;
  getConfigurationsForUsers(): Promise<ConfigurationsForUsersRecord[]>;
  findActiveUser(userId: number): Promise<ConfigUser | null>;
  saveConfigurations(
    userId: number,
    propagateToSubUsers: boolean,
    input: UpdateConfigurationInput,
  ): Promise<ConfigurationRecord>;
}
