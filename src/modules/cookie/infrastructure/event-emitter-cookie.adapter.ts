import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CookieEventPort } from '../application/cookie.port';

@Injectable()
export class EventEmitterCookieAdapter implements CookieEventPort {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitTokenGenerationRequested(cookie: {
    cookie: string;
    status: string;
    createdBy: number;
    pageId: number;
  }): void {
    this.eventEmitter.emit('gen-token-user', cookie);
  }
}
