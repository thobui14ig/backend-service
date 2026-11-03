import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { GroupFacebookController } from './presentation/http/group.controller';
import { GROUP_PORT } from './application/group.port';
import {
  CreateGroupUseCase,
  DeleteGroupUseCase,
  GetGroupUseCase,
  ListGroupsUseCase,
  UpdateGroupUseCase,
} from './application/use-cases/manage-groups.use-cases';
import { TypeOrmGroupAdapter } from './infrastructure/typeorm-group.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity])],
  controllers: [GroupFacebookController],
  providers: [
    CreateGroupUseCase,
    DeleteGroupUseCase,
    GetGroupUseCase,
    ListGroupsUseCase,
    UpdateGroupUseCase,
    TypeOrmGroupAdapter,
    { provide: GROUP_PORT, useExisting: TypeOrmGroupAdapter },
  ],
})
export class GroupModule { }
