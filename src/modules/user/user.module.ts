import { Module } from '@nestjs/common';
import { UserController } from './presentation/http/user.controller';
import { UserEntity } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USER_CREATION_PORT } from './application/user.port';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { TypeOrmUserCreationAdapter } from './infrastructure/typeorm-user-creation.adapter';
import { USER_MANAGEMENT_PORT } from './application/user-management.port';
import {
  ChangeUserPasswordUseCase,
  DeleteUserUseCase,
  FindUserByEmailUseCase,
  GetSubUsersUseCase,
  GetUserByIdUseCase,
  GetUserInfoUseCase,
  GetUsersUseCase,
  UpdateUserUseCase,
  UpdateUserLastActiveUseCase,
} from './application/use-cases/manage-users.use-cases';
import { TypeOrmUserManagementAdapter } from './infrastructure/typeorm-user-management.adapter';
import { USER_RENEWAL_PORT } from './application/user-renewal.port';
import {
  RenewResellerUserServiceUseCase,
  RenewUserServiceUseCase,
} from './application/use-cases/renew-user-service.use-cases';
import { TypeOrmUserRenewalAdapter } from './infrastructure/typeorm-user-renewal.adapter';
import { EnsureUserHasPlanUseCase } from './application/use-cases/ensure-user-has-plan.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    TypeOrmUserCreationAdapter,
    { provide: USER_CREATION_PORT, useExisting: TypeOrmUserCreationAdapter },
    GetUsersUseCase,
    FindUserByEmailUseCase,
    UpdateUserLastActiveUseCase,
    GetSubUsersUseCase,
    GetUserInfoUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ChangeUserPasswordUseCase,
    TypeOrmUserManagementAdapter,
    {
      provide: USER_MANAGEMENT_PORT,
      useExisting: TypeOrmUserManagementAdapter,
    },
    RenewResellerUserServiceUseCase,
    RenewUserServiceUseCase,
    EnsureUserHasPlanUseCase,
    TypeOrmUserRenewalAdapter,
    { provide: USER_RENEWAL_PORT, useExisting: TypeOrmUserRenewalAdapter },
  ],
  exports: [
    GetUserByIdUseCase,
    GetUserInfoUseCase,
    FindUserByEmailUseCase,
    UpdateUserLastActiveUseCase,
    EnsureUserHasPlanUseCase,
  ],
})
export class UserModule { }
