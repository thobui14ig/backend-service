import { UserEntity } from '../../user/entities/user.entity';

export const AUTH_PORT = Symbol('AUTH_PORT');

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPort {
  findUserForLogin(username: string): Promise<
    | (Partial<UserEntity> & { password: string })
    | null
  >;
  createToken(payload: Omit<Partial<UserEntity>, 'password'>): Promise<AuthSession>;
  verifyRefreshToken(token: string): Promise<
    Partial<UserEntity> & { iat?: number; exp?: number }
  >;
  createSessionId(): string;
  saveSession(id: string, value: AuthSession): Promise<void>;
  getSession(id: string): Promise<string | null>;
  deleteSession(id: string): Promise<unknown>;
}
