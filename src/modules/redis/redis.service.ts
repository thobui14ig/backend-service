// redis.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setJson(key: string, value: any): Promise<'OK'> {
    return this.redis.set(key, JSON.stringify(value));
  }

  async delete(key: string) {
    return this.redis.del(key);
  }

  async get(key: string) {
    return this.redis.get(key);
  }
}
