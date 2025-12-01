/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:30:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:30:44
 * @FilePath: \nest-cursor\src\modules\user\user.module.ts
 * @Description: 用户模块
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSummaryService } from './user-summary.service';
import { User } from './entities/user.entity';
import { RoleModule } from '../role/role.module';
import { Target } from '../target/entities/target.entity';
import { Task } from '../target/entities/task.entity';
import { ReadingCheckin } from '../reading/entities/reading-checkin.entity';
import { ErrorBook } from '../errorbook/entities/errorbook.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Target, Task, ReadingCheckin, ErrorBook]),
    RoleModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserSummaryService],
  exports: [UserService, UserSummaryService],
})
export class UserModule {} 