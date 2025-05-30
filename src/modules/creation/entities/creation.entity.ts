/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\entities\creation.entity.ts
 * @Description: 作品实体
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

@Entity('creations')
export class Creation {
  @ApiProperty({ description: '作品ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '作品标题' })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({ description: '作品标题' })
  @Column({ length: 100 })
  type: string; // 表情包， txt2Image，editImage, face2Image, emoji,bg,

  @ApiProperty({ description: '提示词内容' })
  @Column({ type: 'text' })
  prompt: string;

  @ApiProperty({ description: '图片URL数组', type: [String] }) 
  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @ApiProperty({ description: '是否公开到广场', default: false })
  @Column({ default: false })
  isPublic: boolean;

  @ApiProperty({ description: '点赞数', default: 0 })
  @Column({ default: 0 })
  likes: number;

  @ApiProperty({ description: '喜欢数', default: 0 })
  @Column({ default: 0 })
  favorites: number;

  @ApiProperty({ description: '收藏数', default: 0 })
  @Column({ default: 0 })
  collections: number;

  @ApiProperty({ description: '创建人信息', type: () => User })
  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
} 