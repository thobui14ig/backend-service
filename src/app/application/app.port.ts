import { DashboardStats, RequestSong } from '../../app.controller.i';

export const APP_PORT = Symbol('APP_PORT');

export interface DashboardUserScope {
  userId: number;
  isAdmin: boolean;
}

export interface AppPort {
  getDashboardStats(
    user: DashboardUserScope,
    timezone: string,
  ): Promise<DashboardStats>;
  getUserSupport(): Promise<unknown>;
  insertUserSupport(input: RequestSong): Promise<unknown>;
  getExportLink(linkId: number): Promise<unknown>;
  getFbNumber(): Promise<unknown>;
  getVpsSpeed(): Promise<unknown>;
  convertUid(uids: string[]): Promise<Record<string, string>>;
}
