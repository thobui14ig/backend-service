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

  async deleteIfValueMatches(key: string, value: string): Promise<boolean> {
    const deleted = await this.redis.eval(
      "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
      1,
      key,
      value,
    );
    return deleted === 1;
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async *scanKeys(count = 100): AsyncGenerator<string> {
    let cursor = '0';

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'COUNT',
        count,
      );
      cursor = nextCursor;
      yield* keys;
    } while (cursor !== '0');
  }
}
