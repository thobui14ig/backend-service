import { DataSource, Repository } from 'typeorm';
import { LEVEL } from '../../user/entities/user.entity';
import { GetUserInfoUseCase } from '../../user/application/use-cases/manage-users.use-cases';
import { EPlatform, LinkEntity } from '../entities/links.entity';
import { BodyLinkQuery } from '../links.service.i';
import { TypeOrmLinkQueryAdapter } from './typeorm-link-query.adapter';

describe('TypeOrmLinkQueryAdapter', () => {
  it('binds filter values instead of embedding them in the listing query', async () => {
    const query = jest.fn().mockResolvedValue([]);
    const adapter = new TypeOrmLinkQueryAdapter(
      {} as Repository<LinkEntity>,
      { query } as unknown as DataSource,
      {} as GetUserInfoUseCase,
    );
    const keyword = "x') OR 1=1 --";
    const filters = {
      keyword,
      timezone: 'UTC',
    } as BodyLinkQuery;

    await adapter.getLinks({
      filters,
      userLevel: LEVEL.USER,
      userId: 7,
      limit: 20,
      offset: 0,
      platform: EPlatform.FACEBOOK,
      startDate: '2024-01-01 00:00:00',
      endDate: '2024-01-01 23:59:59',
    });

    const [sql, parameters] = query.mock.calls[0];
    expect(sql).not.toContain(keyword);
    expect(parameters).toContain(keyword);
    expect(parameters).toEqual(
      expect.arrayContaining([
        7,
        EPlatform.FACEBOOK,
        20,
        0,
        '2024-01-01 00:00:00',
        '2024-01-01 23:59:59',
      ]),
    );
  });
});
