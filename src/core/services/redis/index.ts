// 在其他服务中使用
import { RedisService } from '@/core/services/redis/redis.service';
import { Injectable } from '@nestjs/common';

@Injectable() 
export class SomeService {
  constructor(private readonly redisService: RedisService) {}
  
  async someMethod() {
    await this.redisService.set('key', 'value', 3600);
  }
} 