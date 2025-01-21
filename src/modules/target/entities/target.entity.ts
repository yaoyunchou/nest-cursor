import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity('targets')
export class Target {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  })
  status: string;

  @Column()
  type: string;

  @Column('float')
  plannedHours: number;

  @Column('float', { default: 0 })
  progress: number;

  @Column('float', { default: 0 })
  completionPercentage: number;

  @OneToMany(() => Task, task => task.target)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 