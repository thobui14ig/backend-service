import { Module } from '@nestjs/common';
import { NotificationController } from './presentation/http/notification.controller';
import { NOTIFICATION_PORT } from './application/notification.port';
import { ListNotificationsUseCase } from './application/use-cases/list-notifications.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { PostgresNotificationAdapter } from './infrastructure/postgres-notification.adapter';

@Module({
  imports: [],
  controllers: [NotificationController],
  providers: [
    ListNotificationsUseCase,
    MarkNotificationReadUseCase,
    PostgresNotificationAdapter,
    { provide: NOTIFICATION_PORT, useExisting: PostgresNotificationAdapter },
  ],
})
export class NotificationModule { }
