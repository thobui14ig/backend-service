import { LEVEL } from '../../user/entities/user.entity';
import { EPlatform } from '../entities/links.entity';
import { BodyLinkQuery } from '../links.service.i';

export interface LinkOrderRecord {
  id: number;
  linkName: string;
  postId: string;
  createdAt: string;
  comments: unknown[];
}

export interface LinkListQuery {
  filters: BodyLinkQuery;
  userLevel: LEVEL;
  userId: number;
  limit: number;
  offset: number;
  platform: EPlatform;
  startDate: string;
  endDate: string;
}

export interface LinkListResult {
  data: unknown[];
  totalCount: number;
}
