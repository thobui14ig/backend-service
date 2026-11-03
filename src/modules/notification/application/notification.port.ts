export const NOTIFICATION_PORT = Symbol('NOTIFICATION_PORT');

export interface NotificationRecord {
  content: string;
  createdAt: string;
  type: string;
  id: number;
  isRead: boolean;
}

export interface NotificationPort {
  findForUser(userId: number): Promise<NotificationRecord[]>;
  markAsRead(id: number): Promise<unknown>;
}
