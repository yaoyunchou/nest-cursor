/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-23
 * @Description: 通知任务实体
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

/**
 * 通知渠道枚举
 */
export enum NotificationChannel {
  FEISHU = 'FEISHU',
  WECHAT_MINI = 'WECHAT_MINI',
  WECHAT_MP = 'WECHAT_MP',
  URL = 'URL',
}

/**
 * 调度类型枚举
 */
export enum ScheduleType {
  ONCE = 'ONCE',
  INTERVAL = 'INTERVAL',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * 通知任务实体
 */
@Entity('notification_task')
export class NotificationTask {
  @ApiProperty({ description: '任务ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '任务名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '任务描述' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '用户ID' })
  @Column()
  userId: number;

  @ApiProperty({ description: '通知渠道', enum: NotificationChannel })
  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @ApiProperty({ description: '渠道配置（JSON）' })
  @Column({ type: 'json' })
  channelConfig: Record<string, any>;

  @ApiProperty({ description: '通知内容（JSON）' })
  @Column({ type: 'json' })
  content: Record<string, any>;

  @ApiProperty({ description: '调度类型', enum: ScheduleType })
  @Column({
    type: 'enum',
    enum: ScheduleType,
  })
  scheduleType: ScheduleType;

  @ApiProperty({ description: '调度配置（JSON）' })
  @Column({ type: 'json' })
  scheduleConfig: Record<string, any>;

  @ApiProperty({ description: '任务状态', enum: TaskStatus, default: TaskStatus.ACTIVE })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.ACTIVE,
  })
  status: TaskStatus;

  @ApiProperty({ description: '下次执行时间' })
  @Column({ type: 'timestamp', nullable: true })
  nextExecuteAt: Date;

  @ApiProperty({ description: '上次执行时间' })
  @Column({ type: 'timestamp', nullable: true })
  lastExecuteAt: Date;

  @ApiProperty({ description: '执行次数', default: 0 })
  @Column({ default: 0 })
  executeCount: number;

  @ApiProperty({ description: '最大执行次数' })
  @Column({ nullable: true })
  maxExecuteCount: number;

  @ApiProperty({ description: '关联的用户', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
