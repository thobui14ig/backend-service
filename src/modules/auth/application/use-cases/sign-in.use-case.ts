import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { UserEntity } from '../../../user/entities/user.entity';
import { AUTH_PORT, AuthPort } from '../auth.port';

interface FailedLogin {
  username: string;
  attempts: number;
  at: string;
}

@Injectable()
export class SignInUseCase {
  private readonly failedLogins: FailedLogin[] = [];

  constructor(@Inject(AUTH_PORT) private readonly auth: AuthPort) {}

  async execute(username: string, password: string) {
    const userWithPassword = await this.auth.findUserForLogin(username);
    const userFail = this.failedLogins.find(
      (item) => item.username === username,
    );

    if (
      userFail &&
      userFail.attempts === 2 &&
      dayjs().isBefore(dayjs(userFail.at).add(1, 'minute'))
    ) {
      throw new HttpException('Vui lòng thử lại sau', HttpStatus.BAD_REQUEST);
    }

    if (userFail && userFail.attempts === 2) {
      this.removeFailedLogin(username);
    }

    const storedPassword = userWithPassword?.password;
    const user: Partial<UserEntity> = userWithPassword
      ? { ...userWithPassword }
      : {};
    delete user.password;
    if (!userWithPassword || storedPassword !== password) {
      this.recordFailedLogin(username, userFail);
      throw new HttpException(
        'Thông tin đăng nhập không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.removeFailedLogin(username);
    const isExpired =
      dayjs().format('YYYY-MM-DD') >
      dayjs(user.expiredAt, 'DD-MM-YYYY').format('YYYY-MM-DD');
    if (isExpired) {
      throw new HttpException('User hết hạn', HttpStatus.BAD_REQUEST);
    }

    const payload = user as Omit<Partial<UserEntity>, 'password'>;
    const token = await this.auth.createToken(payload);
    const sid = this.auth.createSessionId();
    await this.auth.saveSession(sid, token);

    return { token, sid, info: { ...user } };
  }

  private recordFailedLogin(
    username: string,
    existing?: FailedLogin,
  ): void {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
    if (existing) {
      existing.at = timestamp;
      existing.attempts += 1;
      return;
    }

    this.failedLogins.push({ username, attempts: 1, at: timestamp });
  }

  private removeFailedLogin(username: string): void {
    const index = this.failedLogins.findIndex(
      (item) => item.username === username,
    );
    if (index >= 0) this.failedLogins.splice(index, 1);
  }
}
