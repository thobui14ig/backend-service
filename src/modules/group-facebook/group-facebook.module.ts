import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupFacebookEntity } from './entities/group-facebook.entity';
import { GroupFacebookController } from './presentation/http/group-facebook.controller';
import { GROUP_FACEBOOK_PORT } from './application/group-facebook.port';
import {
  CreateGroupFacebookUseCase,
  DeleteGroupFacebookUseCase,
  GetGroupFacebookUseCase,
  ListGroupFacebookUseCase,
  UpdateGroupFacebookUseCase,
} from './application/use-cases/manage-group-facebook.use-cases';
import { TypeOrmGroupFacebookAdapter } from './infrastructure/typeorm-group-facebook.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([GroupFacebookEntity])],
  controllers: [GroupFacebookController],
  providers: [
    CreateGroupFacebookUseCase,
    DeleteGroupFacebookUseCase,
    GetGroupFacebookUseCase,
    ListGroupFacebookUseCase,
    UpdateGroupFacebookUseCase,
    TypeOrmGroupFacebookAdapter,
    { provide: GROUP_FACEBOOK_PORT, useExisting: TypeOrmGroupFacebookAdapter },
  ],
})
export class GroupFacebookModule { }
