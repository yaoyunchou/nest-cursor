import { Global, Module } from '@nestjs/common';
import { RedisModule } from './services/redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  exports: [RedisModule],
})
export class CoreModule {} 