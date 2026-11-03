import { CookieEntity } from '../../../cookie/entities/cookie.entity';
import { FacebookCookiePort } from '../facebook-cookie.port';
import { GenerateFacebookCookieInfoUseCase } from './generate-facebook-cookie-info.use-case';

describe('GenerateFacebookCookieInfoUseCase', () => {
  it('stores the Facebook identifiers extracted from the cookie', async () => {
    const cookie: CookieEntity = {
      id: 1,
      cookie: 'c_user=42',
      createdBy: 7,
      status: undefined,
      fbId: undefined,
      fbDtsg: undefined,
      jazoest: undefined,
      user: undefined,
    };
    const port: FacebookCookiePort = {
      getCookieInfo: jest.fn().mockResolvedValue({
        facebookId: '42',
        fbDtsg: 'token',
        jazoest: '123',
      }),
      saveCookie: jest.fn().mockImplementation(async (value) => value),
    };

    await new GenerateFacebookCookieInfoUseCase(port).execute(cookie);

    expect(port.saveCookie).toHaveBeenCalledWith(
      expect.objectContaining({
        fbId: '42',
        fbDtsg: 'token',
        jazoest: '123',
      }),
    );
  });
});
