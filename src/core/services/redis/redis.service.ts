import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private configService: ConfigService) {
    
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST') ,
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
      db: this.configService.get('REDIS_DB'),
      keyPrefix: this.configService.get('REDIS_PREFIX'),
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  // Redis 操作方法...
  async set(key: string, value: string, ttl: number) {
    await this.redis.set(key, value, 'EX', ttl);
  }

  async get(key: string) {
    return await this.redis.get(key);
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  // 设置过期时间
  async expire(key: string, ttl: number) {
    await this.redis.expire(key, ttl);
  }

  // 获取过期时间
  async ttl(key: string) {
    return await this.redis.ttl(key);
  }
} 