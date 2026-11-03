import { DataSource, Repository } from 'typeorm';
import { IGetCommentParams } from '../comments.service.i';
import { CommentEntity } from '../entities/comment.entity';
import { TypeOrmCommentsAdapter } from './typeorm-comments.adapter';

describe('TypeOrmCommentsAdapter', () => {
  it('binds query filters instead of interpolating user-controlled values', async () => {
    const query = jest.fn().mockImplementation((sql: string) =>
      sql.includes('COUNT(*)')
        ? Promise.resolve([{ totalCount: '1' }])
        : Promise.resolve([{ id: 1 }]),
    );
    const adapter = new TypeOrmCommentsAdapter(
      {} as Repository<CommentEntity>,
      { query } as unknown as DataSource,
    );
    const params: IGetCommentParams = {
      startDate: '',
      endDate: '',
      limit: 20,
      offset: 0,
      keyword: "'); DROP TABLE comments; --",
      timezone: 'Asia/Bangkok',
      isExport: false,
      platform: 'facebook' as IGetCommentParams['platform'],
    };

    await adapter.search({ userId: 10, params });

    expect(query).toHaveBeenCalledTimes(2);
    const [sql, values] = query.mock.calls[0];
    expect(sql).not.toContain(params.keyword);
    expect(values).toContain(params.keyword);
    expect(values).toContain(10);
  });
});
