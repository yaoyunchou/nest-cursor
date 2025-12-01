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
 * 错题本实体
 * 用于存储用户的错题记录
 */
@Entity('errorbooks')
export class ErrorBook {
  @ApiProperty({ description: '错题ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '拍照图片URL列表（多张）', type: [String] })
  @Column({ type: 'json', nullable: false })
  images: string[];

  @ApiProperty({ description: '科目', required: false })
  @Column({ length: 50, nullable: true })
  subject: string;

  @ApiProperty({ description: '备注', required: false })
  @Column({ type: 'text', nullable: true })
  remark: string;

  @ApiProperty({ description: '年级', required: false })
  @Column({ length: 50, nullable: true })
  grade: string;

  @ApiProperty({ description: '单元', required: false })
  @Column({ length: 100, nullable: true })
  unit: string;

  @ApiProperty({ description: 'AI分析结果', required: false })
  @Column({ type: 'text', nullable: true })
  aiAnalysis: string;

  @ApiProperty({ description: '关联的用户' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}

