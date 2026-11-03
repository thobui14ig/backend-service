import { CookieEventPort, CookiePort } from '../cookie.port';
import { CreateCookiesUseCase } from './create-cookies.use-case';

describe('CreateCookiesUseCase', () => {
  const input = {
    cookies: ['cookie-a', 'cookie-b'],
    pageId: 12,
    createdBy: 7,
  };

  it('requests token generation after saving cookies for a standard user', async () => {
    const calls: string[] = [];
    const cookies: CookiePort = {
      create: jest.fn().mockImplementation(async () => {
        calls.push('save');
      }),
      findAllForUser: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const events: CookieEventPort = {
      emitTokenGenerationRequested: jest.fn().mockImplementation(() => {
        calls.push('emit');
      }),
    };
    const useCase = new CreateCookiesUseCase(cookies, events);

    await useCase.execute(input, true);

    expect(calls).toEqual(['save', 'emit', 'emit']);
    expect(events.emitTokenGenerationRequested).toHaveBeenNthCalledWith(1, {
      cookie: 'cookie-a',
      status: 'active',
      createdBy: 7,
      pageId: 12,
    });
  });

  it('does not request token generation for other user levels', async () => {
    const cookies: CookiePort = {
      create: jest.fn(),
      findAllForUser: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const events: CookieEventPort = {
      emitTokenGenerationRequested: jest.fn(),
    };
    const useCase = new CreateCookiesUseCase(cookies, events);

    await useCase.execute(input, false);

    expect(cookies.create).toHaveBeenCalledWith(input);
    expect(events.emitTokenGenerationRequested).not.toHaveBeenCalled();
  });
});
