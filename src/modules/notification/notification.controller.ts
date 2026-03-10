import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { getUser } from "src/common/utils/user";
import { NotificationService } from "./notification.service";

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  findAll(@Req() req: Request) {
    const user = getUser(req);
    return this.notificationService.findAll(user.id);
  }

  @Post()
  updateNoti(@Body() body: { id: number }) {
    return this.notificationService.updateNoti(body.id);
  }
}