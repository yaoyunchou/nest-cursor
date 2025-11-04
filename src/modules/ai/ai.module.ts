import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { User } from '../user/entities/user.entity';
import { Target } from '../target/entities/target.entity';
import { Task } from '../target/entities/task.entity';
import { Creation } from '../creation/entities/creation.entity';

/**
 * AI模块
 * 提供关键词搜索和AI聊天功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Target, Task, Creation]),
    ConfigModule,
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
