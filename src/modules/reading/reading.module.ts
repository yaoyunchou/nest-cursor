import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingTaskController } from './reading-task.controller';
import { ReadingCheckinController } from './reading-checkin.controller';
import { ReadingFileController } from './reading-file.controller';
import { ReadingTaskService } from './reading-task.service';
import { ReadingCheckinService } from './reading-checkin.service';
import { ReadingTask } from './entities/reading-task.entity';
import { ReadingCheckin } from './entities/reading-checkin.entity';
import { User } from '../user/entities/user.entity';
import { FileModule } from '../file/file.module';

/**
 * 读书打卡模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ReadingTask, ReadingCheckin, User]),
    FileModule,
  ],
  controllers: [ReadingTaskController, ReadingCheckinController, ReadingFileController],
  providers: [ReadingTaskService, ReadingCheckinService],
  exports: [ReadingTaskService, ReadingCheckinService],
})
export class ReadingModule {}

