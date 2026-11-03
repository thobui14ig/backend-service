import { UnauthorizedException } from '@nestjs/common';
import { AuthPort } from '../auth.port';
import { RefreshSessionUseCase } from './refresh-session.use-case';

describe('RefreshSessionUseCase', () => {
  it('rotates tokens while preserving the session id', async () => {
    const auth: AuthPort = {
      findUserForLogin: jest.fn(),
      createToken: jest.fn().mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      }),
      verifyRefreshToken: jest
        .fn()
        .mockResolvedValue({ id: 3, level: 0, iat: 10, exp: 20 }),
      createSessionId: jest.fn(),
      saveSession: jest.fn(),
      getSession: jest
        .fn()
        .mockResolvedValue(JSON.stringify({ refreshToken: 'old-refresh' })),
      deleteSession: jest.fn(),
    };
    const useCase = new RefreshSessionUseCase(auth);

    await expect(useCase.execute('sid')).resolves.toEqual({ id: 3, level: 0 });
    expect(auth.deleteSession).toHaveBeenCalledWith('sid');
    expect(auth.saveSession).toHaveBeenCalledWith('sid', {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
  });

  it('rejects malformed or unavailable sessions', async () => {
    const auth: AuthPort = {
      findUserForLogin: jest.fn(),
      createToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      createSessionId: jest.fn(),
      saveSession: jest.fn(),
      getSession: jest.fn().mockResolvedValue('{invalid'),
      deleteSession: jest.fn(),
    };
    const useCase = new RefreshSessionUseCase(auth);

    await expect(useCase.execute('sid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
