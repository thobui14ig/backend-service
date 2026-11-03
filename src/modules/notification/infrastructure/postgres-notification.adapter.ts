import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  NotificationPort,
  NotificationRecord,
} from '../application/notification.port';

@Injectable()
export class PostgresNotificationAdapter implements NotificationPort {
  constructor(private readonly dataSource: DataSource) {}

  findForUser(userId: number): Promise<NotificationRecord[]> {
    return this.dataSource.query(
      `SELECT
        content,
        created_at::TEXT AS "createdAt",
        type,
        id,
        is_read AS "isRead"
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [userId],
    );
  }

  markAsRead(id: number) {
    return this.dataSource.query(
      'UPDATE notifications SET is_read = true WHERE id = $1',
      [id],
    );
  }
}
