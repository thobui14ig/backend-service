import { Inject, Injectable } from '@nestjs/common';
import {
  NOTIFICATION_PORT,
  NotificationPort,
} from '../notification.port';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(NOTIFICATION_PORT)
    private readonly notifications: NotificationPort,
  ) {}

  execute(id: number) {
    return this.notifications.markAsRead(id);
  }
}
