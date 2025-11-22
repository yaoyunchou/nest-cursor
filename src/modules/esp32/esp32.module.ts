/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 20:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 20:00:00
 * @FilePath: \nest-cursor\src\modules\esp32\esp32.module.ts
 * @Description: ESP32芯片模块
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Esp32 } from './entities/esp32.entity';
import { Esp32Service } from './esp32.service';
import { Esp32Controller } from './esp32.controller';
import { SystemLogModule } from '../system-log/system-log.module';
import { NotificationTask } from '../notification-task/entities/notification-task.entity';
import { NotificationTaskModule } from '../notification-task/notification-task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Esp32, NotificationTask]),
    SystemLogModule,
    NotificationTaskModule,
  ],
  controllers: [Esp32Controller],
  providers: [Esp32Service],
  exports: [Esp32Service],
})
export class Esp32Module {}

