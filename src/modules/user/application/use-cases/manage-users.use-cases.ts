import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  USER_MANAGEMENT_PORT,
  UserManagementPort,
} from '../user-management.port';
import { UpdateUserDto } from '../../dto/update-user.dto';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_PORT)
    private readonly users: UserManagementPort,
  ) {}

  execute() {
    return this.users.getAll();
  }
}

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_PORT)
    private readonly users: UserManagementPort,
  ) {}

  execute(username: string) {
    return this.users.findByEmail(username);
  }
}

@Injectable()
export class UpdateUserLastActiveUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_PORT)
    private readonly users: UserManagementPort,
  ) {}

  execute(userId: number) {
    return this.users.updateLastActiveAt(userId);
  }
}

@Injectable()
export class GetSubUsersUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_PORT)
    private readonly users: UserManagementPort,
  ) {}

  execute(userId: number) {
    return this.users.getSubUsers(userId);
  }
}

@Injectable()
export class GetUserInfoUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_PORT)
    private readonly users: UserManagementPort,
  ) {}

  execute(userId: number) {
    return this.users.getInfo(userId);
  }
}

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_PORT)
    private readonly users: UserManagementPort,
  ) {}

  execute(id: number) {
    return this.users.findById(id);
  }
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_PORT)
    private readonly users: UserManagementPort,
  ) {}

  execute(input: UpdateUserDto) {
    return this.users.update(input);
  }
}

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_PORT)
    private readonly users: UserManagementPort,
  ) {}

  execute(id: number) {
    return this.users.delete(id);
  }
}

@Injectable()
export class ChangeUserPasswordUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_PORT)
    private readonly users: UserManagementPort,
  ) {}

  async execute(userId: number, password: string) {
    const user = await this.users.getForPasswordChange(userId);
    if (!user) {
      throw new HttpException('User không tồn tại.', HttpStatus.BAD_REQUEST);
    }

    user.password = password;
    return this.users.save(user);
  }
}
