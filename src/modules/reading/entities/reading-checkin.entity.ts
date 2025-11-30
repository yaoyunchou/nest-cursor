import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { ReadingTask } from './reading-task.entity';

/**
 * 打卡记录实体
 * 用于存储用户的读书打卡记录
 */
@Entity('reading_checkins')
@Unique(['task', 'checkInDate'])
@Index(['task'])
@Index(['user'])
@Index(['checkInDate'])
export class ReadingCheckin {
  @ApiProperty({ description: '打卡记录ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '关联的任务' })
  @ManyToOne(() => ReadingTask, (task) => task.checkins)
  @JoinColumn({ name: 'task_id' })
  task: ReadingTask;

  @ApiProperty({ description: '关联的用户' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: '打卡日期' })
  @Column('date')
  checkInDate: Date;

  @ApiProperty({ description: '录音文件URL', required: false })
  @Column({ nullable: true })
  audioUrl: string;

  @ApiProperty({ description: '录音文件URL列表（多段原始数据）', required: false, type: [String] })
  @Column({ type: 'json', nullable: true })
  audioUrlList: string[];

  @ApiProperty({ description: '录音时长（秒）', required: false })
  @Column({ type: 'int', nullable: true })
  duration: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}

