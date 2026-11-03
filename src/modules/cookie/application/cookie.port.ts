import { CreateCookieInput, UpdateCookieInput } from './cookie.types';

export const COOKIE_PORT = Symbol('COOKIE_PORT');

export interface CookieRecord {
  id: number;
  cookie: string;
  status: string;
  createdBy: number;
  pageId?: number | null;
}

export interface CookiePort {
  create(input: CreateCookieInput): Promise<void>;
  findAllForUser(userId: number): Promise<CookieRecord[]>;
  findAll(): Promise<CookieRecord[]>;
  findOne(id: number): Promise<CookieRecord | null>;
  update(id: number, input: UpdateCookieInput): Promise<CookieRecord>;
  remove(id: number): Promise<unknown>;
}

export interface CookieEventPort {
  emitTokenGenerationRequested(cookie: {
    cookie: string;
    status: string;
    createdBy: number;
    pageId?: number;
  }): void;
}

export const COOKIE_EVENT_PORT = Symbol('COOKIE_EVENT_PORT');
