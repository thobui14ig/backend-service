import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { USER_CREATION_PORT, UserCreationPort } from '../user.port';
import { CreateUserDto } from '../../dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_CREATION_PORT)
    private readonly users: UserCreationPort,
  ) {}

  async execute(input: CreateUserDto) {
    const user = {
      ...input,
      username: input.username.trim().toLowerCase(),
      password: input.password.trim(),
      phone: input.phone.trim(),
    };

    if (await this.users.usernameExists(user.username)) {
      throw new HttpException('User đã tồn tại.', HttpStatus.BAD_REQUEST);
    }

    const created = await this.users.save(user);
    if (created.id === undefined) {
      throw new Error('User persistence returned no id after creation.');
    }
    return this.users.initializeConfiguration(created.id);
  }
}
