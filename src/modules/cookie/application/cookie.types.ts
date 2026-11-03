import { CookieStatus } from '../domain/cookie-status.enum';

export interface CreateCookieInput {
  cookies: string[];
  pageId?: number;
  createdBy: number;
}

export interface UpdateCookieInput {
  status?: CookieStatus;
}
