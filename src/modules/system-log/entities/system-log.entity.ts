/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 21:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 21:00:00
 * @FilePath: \nest-cursor\src\modules\system-log\entities\system-log.entity.ts
 * @Description: 系统日志实体
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  ALERT = 'alert',
}

export enum LogModule {
  ESP32 = 'esp32',
  SYSTEM = 'system',
  AUTH = 'auth',
  USER = 'user',
  FILE = 'file',
}

@Entity('system_log')
export class SystemLog {
  @ApiProperty({ description: '日志ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '日志级别', enum: LogLevel })
  @Column({
    type: 'enum',
    enum: LogLevel,
    default: LogLevel.INFO,
  })
  level: LogLevel;

  @ApiProperty({ description: '模块名称', enum: LogModule })
  @Column({
    type: 'enum',
    enum: LogModule,
    default: LogModule.SYSTEM,
  })
  module: LogModule;

  @ApiProperty({ description: '日志内容' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: '关联ID（如芯片ID、用户ID等）' })
  @Column({ nullable: true })
  relatedId: string;

  @ApiProperty({ description: '额外数据（JSON格式）' })
  @Column({ type: 'text', nullable: true })
  extraData: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;
}

