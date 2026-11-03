import { Inject, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { LINK_QUERY_PORT, LinkQueryPort } from '../link-query.port';
import { EPlatform } from '../../entities/links.entity';
import { LEVEL } from '../../../user/entities/user.entity';
import { BodyLinkQuery } from '../../links.service.i';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class GetLinksUseCase {
  constructor(
    @Inject(LINK_QUERY_PORT)
    private readonly queries: LinkQueryPort,
  ) {}

  execute(
    filters: BodyLinkQuery,
    userLevel: LEVEL,
    userId: number,
    limit: number,
    offset: number,
    platform: EPlatform,
  ) {
    const currentDay = dayjs().tz(filters.timezone);
    return this.queries.getLinks({
      filters,
      userLevel,
      userId,
      limit,
      offset,
      platform,
      startDate: currentDay.startOf('day').utc().format('YYYY-MM-DD HH:mm:ss'),
      endDate: currentDay.endOf('day').utc().format('YYYY-MM-DD HH:mm:ss'),
    });
  }
}
