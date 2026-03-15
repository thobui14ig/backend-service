// redis.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async SLAVEOF() {
    await this.redis.call('SLAVEOF', ['NO', 'ONE']);

    return this.clearAll();
  }

  async clearAll() {
    await this.redis.flushall();
  }

  async setJson(key: string, value: any): Promise<'OK'> {
    return this.redis.set(key, JSON.stringify(value));
  }

  async get(key: string) {
    return this.redis.get(key);
  }
}
