import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Target } from './target.entity';

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

  // 关联的目标
  @ManyToOne(() => Target, target => target.tasks)
  target: Target;

  // 创建时间
  @CreateDateColumn()
  createdAt: Date;

  // 更新时间
  @UpdateDateColumn()
  updatedAt: Date;
} 