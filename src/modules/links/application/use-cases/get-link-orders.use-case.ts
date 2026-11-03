import { Inject, Injectable } from '@nestjs/common';
import { LINK_QUERY_PORT, LinkQueryPort } from '../link-query.port';

@Injectable()
export class GetLinkOrdersUseCase {
  constructor(
    @Inject(LINK_QUERY_PORT)
    private readonly queries: LinkQueryPort,
  ) {}

  execute(userId: number) {
    return this.queries.getOrders(userId);
  }
}
