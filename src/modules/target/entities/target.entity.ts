import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../user/entities/user.entity';

/**
 * 目标实体
 * 用于存储用户创建的目标信息
 */
@Entity('targets')
export class Target {
  @PrimaryGeneratedColumn()
  id: number;

  // 目标名称
  @Column()
  name: string;

  // 目标详细描述
  @Column('text')
  description: string;

  // 目标当前状态
  @Column({
    type: 'enum',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  })
  status: string;


  // 目标计划完成时间（小时）
  @Column('float')
  plannedHours: number;

  // 当前已完成时间（小时）
  @Column('float', { default: 0 })
  progress: number;

  // 完成百分比（0-100）
  @Column('float', { default: 0 })
  completionPercentage: number;

  // 目标开始时间
  @Column('timestamp')
  startTime: Date;

  // 目标结束时间
  @Column('timestamp')
  endTime: Date;

  // 关联的任务列表
  @OneToMany(() => Task, task => task.target)
  tasks: Task[];

  // 关联的用户（多对一关系：一个目标属于一个用户）
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // 创建时间
  @CreateDateColumn()
  createdAt: Date;

  // 更新时间
  @UpdateDateColumn()
  updatedAt: Date;
} 