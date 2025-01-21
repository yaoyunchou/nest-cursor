import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, JoinTable } from 'typeorm';
import { Target } from './target.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

/**
 * 任务实体
 * 用于记录目标下的具体任务
 */
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  // 任务名称
  @Column()
  name: string;

  // 任务详细描述
  @Column('text')
  description: string;

  // 任务耗时（小时）
  @Column('float')
  time: number;

  // 关联的用户ID
  @Column()
  userId: number;

  // 上传图片内容
  @Column('text', { nullable: true })
  image: string;

  // 关联的目标, 创建task_target表,记录task和target的关系,创建对应的任务的时候,会自动创建对应的task_target记录
  @ManyToOne(() => Target, target => target.tasks)
  @JoinColumn({ name: 'targetId' })
  @JoinTable({ name: 'task_target' , joinColumn: { name: 'taskId', referencedColumnName: 'id' }, inverseJoinColumn: { name: 'targetId', referencedColumnName: 'id' } })
  target: Target;

  // 创建时间
  @CreateDateColumn()
  createdAt: Date;

  // 更新时间
  @UpdateDateColumn()
  updatedAt: Date;
} 