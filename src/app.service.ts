import { Injectable } from '@nestjs/common';
import { LEVEL, UserEntity } from './modules/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { DashboardStats, UserSupportDto } from './app.controller.i';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class AppService {
  constructor(private connection: DataSource) {}

  async getDashboardStats(user: UserEntity, timezone: string): Promise<DashboardStats> {
    const currentDay = dayjs().tz(timezone)
    const startDate = currentDay.startOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
    const endDate = currentDay.endOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
    
    const res = await this.connection.query(`
      SELECT jsonb_build_object(
          'comment', (
	          SELECT jsonb_build_object(
	              'total', COUNT(*),
	              'today', COUNT(*) FILTER (
	                  WHERE c.created_at >= '${startDate}'
	                    AND c.created_at <  '${endDate}'
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
    if (user.level === LEVEL.USER) {
        delete res[0].data.proxy
        delete res[0].data.token
    }

    return res[0].data
  }

  getUserSupport() {
    return this.connection.query(`
        SELECT id, name, content, amount
        FROM user_support
        ORDER BY created_at DESC;       
    `)
  }

  insertUserSupport(dto: UserSupportDto) {
    const { content, amount, name } = dto
    return this.connection.query(`
        INSERT INTO user_support (name, content, amount)
        VALUES ('${name}', '${content}', ${amount??0});        
    `)
  }
}
