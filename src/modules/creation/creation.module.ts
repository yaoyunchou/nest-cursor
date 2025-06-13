/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\creation.module.ts
 * @Description: 创作模块
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CreationService } from './creation.service';
import { CozeService } from './services/coze.service';
import { CreationController } from './creation.controller';
import { Creation } from './entities/creation.entity';
import { UserCollection } from './entities/user-collection.entity';
import { FileResource } from './entities/file-resource.entity';
import { FileResourceService } from './services/file-resource.service';
import { FileResourceController } from './file-resource.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Creation, UserCollection, FileResource]),
    ConfigModule, // 为了在CozeService中使用ConfigService
  ],
  controllers: [CreationController, FileResourceController],
  providers: [CreationService, CozeService, FileResourceService],
  exports: [CreationService, CozeService, FileResourceService],
})
export class CreationModule {} 