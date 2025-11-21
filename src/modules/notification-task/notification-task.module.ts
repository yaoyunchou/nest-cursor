/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-23
 * @Description: 通知任务模块
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTaskController } from './notification-task.controller';
import { NotificationTaskService } from './notification-task.service';
import { NotificationService } from './services/notification.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';
import { NotificationTask } from './entities/notification-task.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { UserModule } from '../user/user.module';
import { DictionaryModule } from '../dictionary/dictionary.module';

/**
 * 通知任务模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationTask, NotificationLog]),
    UserModule,
    DictionaryModule,
  ],
  controllers: [NotificationTaskController],
  providers: [NotificationTaskService, NotificationService, NotificationSchedulerService],
  exports: [NotificationTaskService, NotificationService],
})
export class NotificationTaskModule {}

