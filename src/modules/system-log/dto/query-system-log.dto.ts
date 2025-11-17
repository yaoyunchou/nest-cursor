/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 21:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 21:00:00
 * @FilePath: \nest-cursor\src\modules\system-log\dto\query-system-log.dto.ts
 * @Description: 查询系统日志DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LogLevel, LogModule } from '../entities/system-log.entity';

export class QuerySystemLogDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageIndex?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiProperty({ description: '日志级别', enum: LogLevel, required: false })
  @IsOptional()
  @IsEnum(LogLevel)
  level?: LogLevel;

  @ApiProperty({ description: '模块名称', enum: LogModule, required: false })
  @IsOptional()
  @IsEnum(LogModule)
  module?: LogModule;

  @ApiProperty({ description: '关联ID', required: false })
  @IsOptional()
  @IsString()
  relatedId?: string;
}

