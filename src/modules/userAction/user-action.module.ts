import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActionController } from './user-action.controller';
import { UserActionService } from './user-action.service';
import { UserActionEntity } from './entities/user-action.entity';

/**
 * 用户打卡模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserActionEntity])],
  controllers: [UserActionController],
  providers: [UserActionService],
  exports: [UserActionService],
})
export class UserActionModule {} 