/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-23
 * @Description: 创建通知任务DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
  Min,
  IsDateString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationChannel, ScheduleType } from '../entities/notification-task.entity';

/**
 * 飞书渠道配置
 */
export class FeishuChannelConfig {
  @ApiProperty({ description: '飞书应用ID' })
  @IsString()
  appId: string;

  @ApiProperty({ description: '飞书应用密钥' })
  @IsString()
  appSecret: string;

  @ApiProperty({ description: '飞书用户ID（open_id）' })
  @IsString()
  userId: string;
}

/**
 * 微信小程序渠道配置
 */
export class WechatMiniChannelConfig {
  @ApiProperty({ description: '小程序账号ID（UUID）' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: '模板ID' })
  @IsString()
  templateId: string;

  @ApiProperty({ description: '跳转页面路径' })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiProperty({ description: '模板数据' })
  @IsObject()
  data: Record<string, any>;
}

/**
 * 微信公众号渠道配置
 */
export class WechatMpChannelConfig {
  @ApiProperty({ description: '公众号账号ID（UUID）' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: '模板ID' })
  @IsString()
  templateId: string;

  @ApiProperty({ description: '跳转URL' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ description: '模板数据' })
  @IsObject()
  data: Record<string, any>;
}

/**
 * URL渠道配置
 */
export class UrlChannelConfig {
  @ApiProperty({ description: '请求URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: '请求方法', enum: ['GET', 'POST', 'PUT', 'DELETE'], default: 'POST' })
  @IsEnum(['GET', 'POST', 'PUT', 'DELETE'])
  @IsOptional()
  method?: string;

  @ApiProperty({ description: '请求头' })
  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;

  @ApiProperty({ description: '请求体' })
  @IsObject()
  @IsOptional()
  body?: Record<string, any>;
}

/**
 * 一次性调度配置
 */
export class OnceScheduleConfig {
  @ApiProperty({ description: '执行时间' })
  @IsDateString()
  executeAt: string;
}

/**
 * 间隔调度配置
 */
export class IntervalScheduleConfig {
  @ApiProperty({ description: '间隔小时数' })
  @IsNumber()
  @Min(1)
  intervalHours: number;

  @ApiProperty({ description: '开始时间' })
  @IsDateString()
  startAt: string;
}

/**
 * 每日调度配置
 */
export class DailyScheduleConfig {
  @ApiProperty({ description: '执行时间（格式：HH:mm）', example: '09:00' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: '时间格式必须为 HH:mm' })
  time: string;
}

/**
 * 每周调度配置
 */
export class WeeklyScheduleConfig {
  @ApiProperty({ description: '星期几（0-6，0=周日）' })
  @IsNumber()
  @Min(0)
  dayOfWeek: number;

  @ApiProperty({ description: '执行时间（格式：HH:mm）', example: '09:00' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: '时间格式必须为 HH:mm' })
  time: string;
}

/**
 * 每月调度配置
 */
export class MonthlyScheduleConfig {
  @ApiProperty({ description: '每月几号（1-31）' })
  @IsNumber()
  @Min(1)
  dayOfMonth: number;

  @ApiProperty({ description: '执行时间（格式：HH:mm）', example: '09:00' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: '时间格式必须为 HH:mm' })
  time: string;
}

/**
 * 创建通知任务DTO
 */
export class CreateNotificationTaskDto {
  @ApiProperty({ description: '任务名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '任务描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '用户ID' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '通知渠道', enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ description: '渠道配置' })
  @IsObject()
  channelConfig: FeishuChannelConfig | WechatMiniChannelConfig | WechatMpChannelConfig | UrlChannelConfig;

  @ApiProperty({ description: '通知内容' })
  @IsObject()
  content: Record<string, any>;

  @ApiProperty({ description: '调度类型', enum: ScheduleType })
  @IsEnum(ScheduleType)
  scheduleType: ScheduleType;

  @ApiProperty({ description: '调度配置' })
  @IsObject()
  scheduleConfig: OnceScheduleConfig | IntervalScheduleConfig | DailyScheduleConfig | WeeklyScheduleConfig | MonthlyScheduleConfig;

  @ApiProperty({ description: '最大执行次数', required: false })
  @IsNumber()
  @IsOptional()
  maxExecuteCount?: number;
}
