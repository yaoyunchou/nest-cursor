import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';

/**
 * Redis模块
 * 使用@Global()装饰器使其成为全局模块
 * 这样其他模块不需要手动导入就可以使用 RedisService
 */
@Global()
@Module({
  imports: [ConfigModule], // 导入 ConfigModule 以使用配置服务
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {} 