import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
import { AppInfrastructureAdapter } from './app.infrastructure.adapter';

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('AppInfrastructureAdapter', () => {
  const query = jest.fn().mockResolvedValue([]);
  const adapter = new AppInfrastructureAdapter(
    { query } as unknown as DataSource,
    {} as HttpService,
  );

  beforeEach(() => query.mockClear());

  it('binds user support fields as SQL parameters', async () => {
    const input = {
      full_name: "name'); DROP TABLE buyers; --",
      phone: '555-0100',
      address: 'test',
    };

    await adapter.insertUserSupport(input);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('VALUES ($1, $2, $3)'),
      [input.full_name, input.phone, input.address],
    );
  });

  it('binds the exported link identifier as a SQL parameter', async () => {
    await adapter.getExportLink(23);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE link_id = $1'),
      [23],
    );
  });
});
