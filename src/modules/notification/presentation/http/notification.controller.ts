import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { getUser } from '../../../../common/utils/user';
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications.use-case';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-notification-read.use-case';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly listNotifications: ListNotificationsUseCase,
    private readonly markNotificationRead: MarkNotificationReadUseCase,
  ) {}

  @Get()
  findAll(@Req() req: Request) {
    const user = getUser(req);
    return this.listNotifications.execute(user.id);
  }

  @Post()
  updateNoti(@Body() body: { id: number }) {
    return this.markNotificationRead.execute(body.id);
  }
}