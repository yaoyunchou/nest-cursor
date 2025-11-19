/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-23
 * @Description: 查询通知任务DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationChannel, TaskStatus } from '../entities/notification-task.entity';

/**
 * 查询通知任务DTO
 */
export class QueryNotificationTaskDto {
  @ApiProperty({ description: '每页数量', default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number = 10;

  @ApiProperty({ description: '页码', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageIndex?: number = 1;

  @ApiProperty({ description: '用户ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @ApiProperty({ description: '通知渠道', enum: NotificationChannel, required: false })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiProperty({ description: '任务状态', enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
