import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { DataSource } from 'typeorm';
import { DashboardStats, RequestSong } from './app.controller.i';
import { LEVEL, UserEntity } from './modules/user/entities/user.entity';
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
                    ),
                    'pendingPhoneCommentCount', COUNT(*) FILTER (
                        WHERE c.created_at >= '${startDate}'
                            AND c.created_at <  '${endDate}'
                            and c.is_process_phone = false and c.phone_number is null 
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
            ),
            'transaction', (
                SELECT json_build_object(
                    'totalIncome', SUM(amount) FILTER (WHERE type = 'income'),
                    'totalExpense', SUM(amount) FILTER (WHERE type = 'expense'),
                    'currentMonthIncome', SUM(amount) FILTER (
                        WHERE type = 'income'
                        AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
                        AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                    ),
                    'currentMonthExpense', SUM(amount) FILTER (
                        WHERE type = 'expense'
                        AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
                        AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                    )
                ) AS summary
                FROM transactions
            )
        ) AS data;
        `)
        if (user.level === LEVEL.USER) {
            delete res[0].data.proxy
            delete res[0].data.token
            delete res[0].data.transaction
        }

        return res[0].data
    }

    getUserSupport() {
        return this.connection.query(`
            select * from buyers
        `)
    }

    async insertUserSupport(dto: RequestSong): Promise<any> {
        const { full_name, phone, address } = dto;

        return await this.connection.query(`
            INSERT INTO buyers (full_name, phone, address)
            VALUES ('${full_name}', '${phone}', '${address}') 
        `);
    }

    async getConfig(userId: number) {
        const res = await this.connection.query(`
            select 
                user_id as "userId",
                excel_id as "excelId",
                link_id as "linkId"
                from config
                where user_id=${userId}    
        `)
            
        return res?.[0]??null
    }

    async getExportLink(linkId: number) {
        const res = await this.connection.query(`
                SELECT comment_ids as "commentIds"
            FROM export_link
            WHERE link_id = ${linkId};    
        `)

        return res?.[0]??[]
    }

    async updateExportLink(linkId: number, commentIds: number[]) {
            return this.connection.query(
            `
            INSERT INTO export_link (link_id, comment_ids)
            VALUES ($1, $2::bigint[])
            ON CONFLICT (link_id)
            DO UPDATE SET
                comment_ids = export_link.comment_ids || (
                SELECT COALESCE(ARRAY(
                    SELECT x
                    FROM UNNEST(EXCLUDED.comment_ids) AS x
                    WHERE NOT (x = ANY(export_link.comment_ids))
                ), '{}')
                )
            RETURNING *;
            `,
            [linkId, commentIds]
            );
    }

    async getFbNumber() {
        const apiKey =
            '76248c24c84a973764d63de9a9a0031bIiFO2LBVE0h39aWMzUJK7fXdCDPmZexT';

        const url = `https://dichvuviavip.com/api/profile.php?api_key=${apiKey}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0',
            },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        return await response.json();
    }
}
