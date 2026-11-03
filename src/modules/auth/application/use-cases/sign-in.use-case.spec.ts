import { HttpException } from '@nestjs/common';
import { AuthPort } from '../auth.port';
import { SignInUseCase } from './sign-in.use-case';

describe('SignInUseCase', () => {
  const user = {
    id: 3,
    username: 'sample',
    password: 'secret',
    level: 0,
    expiredAt: '2999-12-31',
  };

  it('creates a session and excludes the password from the response', async () => {
    const auth: AuthPort = {
      findUserForLogin: jest.fn().mockResolvedValue(user),
      createToken: jest.fn().mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
      verifyRefreshToken: jest.fn(),
      createSessionId: jest.fn().mockReturnValue('session-id'),
      saveSession: jest.fn(),
      getSession: jest.fn(),
      deleteSession: jest.fn(),
    };
    const useCase = new SignInUseCase(auth);

    await expect(useCase.execute('sample', 'secret')).resolves.toEqual({
      token: { accessToken: 'access', refreshToken: 'refresh' },
      sid: 'session-id',
      info: {
        id: 3,
        username: 'sample',
        level: 0,
        expiredAt: '2999-12-31',
      },
    });
    expect(auth.saveSession).toHaveBeenCalledWith('session-id', {
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  it('rejects invalid credentials', async () => {
    const auth: AuthPort = {
      findUserForLogin: jest.fn().mockResolvedValue(null),
      createToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      createSessionId: jest.fn(),
      saveSession: jest.fn(),
      getSession: jest.fn(),
      deleteSession: jest.fn(),
    };
    const useCase = new SignInUseCase(auth);

    await expect(useCase.execute('missing', 'wrong')).rejects.toBeInstanceOf(
      HttpException,
    );
    expect(auth.saveSession).not.toHaveBeenCalled();
  });
});
