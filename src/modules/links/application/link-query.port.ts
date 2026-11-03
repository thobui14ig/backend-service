import {
  LinkListQuery,
  LinkListResult,
  LinkOrderRecord,
} from './link-query.types';

export const LINK_QUERY_PORT = Symbol('LINK_QUERY_PORT');

export interface LinkQueryPort {
  getTotalLinks(userId: number): Promise<{ count: number; planId: number }>;
  getOrders(userId: number): Promise<LinkOrderRecord[]>;
  getLinks(input: LinkListQuery): Promise<LinkListResult>;
}
