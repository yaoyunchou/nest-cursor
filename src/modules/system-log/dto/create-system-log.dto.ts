/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 21:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 21:00:00
 * @FilePath: \nest-cursor\src\modules\system-log\dto\create-system-log.dto.ts
 * @Description: 创建系统日志DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { LogLevel, LogModule } from '../entities/system-log.entity';

export class CreateSystemLogDto {
  @ApiProperty({ description: '日志级别', enum: LogLevel })
  @IsEnum(LogLevel)
  level: LogLevel;

  @ApiProperty({ description: '模块名称', enum: LogModule })
  @IsEnum(LogModule)
  module: LogModule;

  @ApiProperty({ description: '日志内容' })
  @IsString()
  content: string;

  @ApiProperty({ description: '关联ID', required: false })
  @IsString()
  @IsOptional()
  relatedId?: string;

  @ApiProperty({ description: '额外数据（JSON字符串）', required: false })
  @IsString()
  @IsOptional()
  extraData?: string;
}

