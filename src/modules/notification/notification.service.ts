import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { LEVEL } from "../user/entities/user.entity";

@Injectable()
export class NotificationService {
  constructor(
    private connection: DataSource
  ) {}

  findAll(userId: number) {
    return this.connection.query(`
        SELECT 
        content,
        created_at::TEXT as "createdAt",
        type,
        id,
        is_read as "isRead"
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC;    
    `, [userId])
  }

  updateNoti(id: number) {
    return this.connection.query(`
        update notifications set is_read = true where id=$1
    `, [id]) 
  }
}