import { Inject, Injectable } from '@nestjs/common';
import { getPlan } from '../../../../common/utils/plan';
import { LINK_QUERY_PORT, LinkQueryPort } from '../link-query.port';

@Injectable()
export class GetLinkSummaryUseCase {
  constructor(
    @Inject(LINK_QUERY_PORT)
    private readonly queries: LinkQueryPort,
  ) {}

  async execute(userId: number) {
    const { count, planId } = await this.queries.getTotalLinks(userId);
    const plan = getPlan(planId, userId);
    return `${count}/${plan?.maxLinks ?? 0}`;
  }
}
