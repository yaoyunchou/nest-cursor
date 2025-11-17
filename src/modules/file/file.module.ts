/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: 筑梦者 303630573@qq.com
 * @LastEditTime: 2025-01-18 11:04:04
 * @FilePath: \nest-cursor\src\modules\file\file.module.ts
 * @Description: 文件模块
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { QiniuService } from './qiniu.service';
import { File } from './entities/file.entity';
import { QiniuService } from './qiniu.service';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FileController],
  providers: [FileService,QiniuService],
  exports: [FileService],
})
export class FileModule {} 