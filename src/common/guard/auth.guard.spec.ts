import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/modules/auth/auth.service';
import { LEVEL } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { AuthGuard } from './auth.guard';

jest.mock('uuid', () => ({ v4: jest.fn() }));

describe('AuthGuard', () => {
  const verifyAsync = jest.fn();
  const get = jest.fn();
  const refreshToken = jest.fn();
  const updateLastActiveAt = jest.fn();
  const getAllAndOverride = jest.fn();
  let guard: AuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    getAllAndOverride.mockReturnValue(false);
    guard = new AuthGuard(
      { verifyAsync } as unknown as JwtService,
      { getAllAndOverride } as unknown as Reflector,
      { get } as unknown as RedisService,
      { refreshToken } as unknown as AuthService,
      { updateLastActiveAt } as unknown as UserService,
    );
  });

  function createContext(cookie?: string) {
    const request = { headers: { cookie } };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    return { context, request };
  }

  it('rejects requests without a session cookie', async () => {
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(get).not.toHaveBeenCalled();
  });

  it('rejects malformed session data instead of allowing an unauthenticated request', async () => {
    const { context } = createContext('sid=session-id');
    get.mockResolvedValue('{invalid-json');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(refreshToken).not.toHaveBeenCalled();
  });

  it('attaches the refreshed user when the access token has expired', async () => {
    const { context, request } = createContext('sid=session-id');
    const user = { id: 15, level: LEVEL.USER };
    get.mockResolvedValue(JSON.stringify({ accessToken: 'expired-access-token' }));
    verifyAsync.mockRejectedValue(new Error('expired'));
    refreshToken.mockResolvedValue(user);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(refreshToken).toHaveBeenCalledWith('session-id');
    expect(request['user']).toEqual(user);
    expect(updateLastActiveAt).toHaveBeenCalledWith(user.id);
  });

  it('rejects the request when an expired access token cannot be refreshed', async () => {
    const { context } = createContext('sid=session-id');
    get.mockResolvedValue(JSON.stringify({ accessToken: 'expired-access-token' }));
    verifyAsync.mockRejectedValue(new Error('expired'));
    refreshToken.mockRejectedValue(new UnauthorizedException());

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(updateLastActiveAt).not.toHaveBeenCalled();
  });
});
