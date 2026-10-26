import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ConfigEntity } from './entities/config.entity';
import { ConfigurationService } from './config.service';
import { ConfigurationController } from './config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigEntity, UserEntity])],
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
