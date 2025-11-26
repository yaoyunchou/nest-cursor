import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { ReadingCheckin } from './reading-checkin.entity';

/**
 * 读书任务实体
 * 用于存储用户创建的读书任务信息
 */
@Entity('reading_tasks')
export class ReadingTask {
  @ApiProperty({ description: '任务ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '任务名称' })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ description: '开始日期' })
  @Column('date')
  startDate: Date;

  @ApiProperty({ description: '结束日期' })
  @Column('date')
  endDate: Date;

  @ApiProperty({ description: '任务状态', enum: ['pending', 'in_progress', 'completed'] })
  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  })
  status: string;

  @ApiProperty({ description: '总打卡次数' })
  @Column({ default: 0 })
  totalCheckIns: number;

  @ApiProperty({ description: '已完成打卡次数' })
  @Column({ default: 0 })
  completedCheckIns: number;

  @ApiProperty({ description: '关联的用户' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: '关联的打卡记录' })
  @OneToMany(() => ReadingCheckin, (checkin) => checkin.task)
  checkins: ReadingCheckin[];

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}

