import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ConfigEntity } from './entities/config.entity';
import { ConfigurationController } from './presentation/http/configuration.controller';
import { CONFIGURATION_PORT } from './application/configuration.port';
import { GetConfigurationUseCase } from './application/use-cases/get-configuration.use-case';
import { GetConfigurationsForUsersUseCase } from './application/use-cases/get-configurations-for-users.use-case';
import { GetUserConfigurationUseCase } from './application/use-cases/get-user-configuration.use-case';
import { UpdateUserConfigurationUseCase } from './application/use-cases/update-user-configuration.use-case';
import { TypeOrmConfigurationAdapter } from './infrastructure/typeorm-configuration.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigEntity, UserEntity])],
  controllers: [ConfigurationController],
  providers: [
    GetConfigurationUseCase,
    GetConfigurationsForUsersUseCase,
    GetUserConfigurationUseCase,
    UpdateUserConfigurationUseCase,
    TypeOrmConfigurationAdapter,
    {
      provide: CONFIGURATION_PORT,
      useExisting: TypeOrmConfigurationAdapter,
    },
  ],
  exports: [
    GetConfigurationUseCase,
    GetConfigurationsForUsersUseCase,
    GetUserConfigurationUseCase,
    UpdateUserConfigurationUseCase,
  ],
})
export class ConfigurationModule {}
