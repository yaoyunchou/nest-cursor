/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-23
 * @Description: 通知日志实体
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationTask, NotificationChannel } from './notification-task.entity';

/**
 * 执行状态枚举
 */
export enum LogStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

/**
 * 通知日志实体
 */
@Entity('notification_log')
export class NotificationLog {
  @ApiProperty({ description: '日志ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '任务ID' })
  @Column()
  taskId: number;

  @ApiProperty({ description: '用户ID' })
  @Column()
  userId: number;

  @ApiProperty({ description: '通知渠道', enum: NotificationChannel })
  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @ApiProperty({ description: '执行状态', enum: LogStatus })
  @Column({
    type: 'enum',
    enum: LogStatus,
  })
  status: LogStatus;

  @ApiProperty({ description: '请求数据（JSON）' })
  @Column({ type: 'json', nullable: true })
  requestData: Record<string, any>;

  @ApiProperty({ description: '响应数据（JSON）' })
  @Column({ type: 'json', nullable: true })
  responseData: Record<string, any>;

  @ApiProperty({ description: '错误信息' })
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @ApiProperty({ description: '执行时间' })
  @Column({ type: 'timestamp' })
  executeAt: Date;

  @ApiProperty({ description: '关联的任务', type: () => NotificationTask })
  @ManyToOne(() => NotificationTask)
  @JoinColumn({ name: 'taskId' })
  task: NotificationTask;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;
}
