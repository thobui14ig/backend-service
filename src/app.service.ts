import { Injectable } from '@nestjs/common';
import { LEVEL, UserEntity } from './modules/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { DashboardStats } from './app.controller.i';

@Injectable()
export class AppService {
  constructor(private connection: DataSource) {}

  async getDashboardStats(user: UserEntity): Promise<DashboardStats> {
    const condition = user.level === LEVEL.USER ? user.id : ``

    const res = await this.connection.query(`
      SELECT jsonb_build_object(
          'comment', (
	          SELECT jsonb_build_object(
	              'total', COUNT(*),
	              'today', COUNT(*) FILTER (
	                  WHERE c.created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
	                    AND c.created_at <  date_trunc('day', now() AT TIME ZONE 'UTC') + INTERVAL '1 day'
	              )
	          )
	          FROM comments c
	          ${user.level === LEVEL.USER ? `join links l on l.id = c.link_id and l.user_id = ${user.id}` : ""}
          ),

          'link', (
              SELECT jsonb_build_object(
                  'die', COUNT(*) FILTER (WHERE type = 'die'),
                  'undefined', COUNT(*) FILTER (WHERE type = 'undefined'),
                  'live', COUNT(*) FILTER (WHERE type IN ('public', 'private'))
              )
              FROM links 
              WHERE is_deleted = false ${user.level === LEVEL.USER ? `and links.user_id = ${user.id}` : ""}
          ),

          'proxy', (
              SELECT jsonb_build_object(
                  'active', COUNT(*) FILTER (WHERE status = 'active'),
                  'inactive', COUNT(*) FILTER (WHERE status = 'inactive')
              )
              FROM proxy
          ),

          'token', (
              SELECT jsonb_build_object(
                  'active', COUNT(*) FILTER (WHERE status = 'active'),
                  'limit', COUNT(*) FILTER (WHERE status = 'limit'),
                  'die', COUNT(*) FILTER (WHERE status = 'die')
              )
              FROM token
          )
      ) AS data;
    `)

    return res[0].data
  }
}
