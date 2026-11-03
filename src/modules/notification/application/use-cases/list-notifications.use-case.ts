import { Inject, Injectable } from '@nestjs/common';
import {
  NOTIFICATION_PORT,
  NotificationPort,
} from '../notification.port';

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_PORT)
    private readonly notifications: NotificationPort,
  ) {}

  execute(userId: number) {
    return this.notifications.findForUser(userId);
  }
}
