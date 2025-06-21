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
  type: string; 

  // 表情包， txt2Image，editImage, face2Image, emoji,bg,
  @ApiProperty({ description: '作品简介' })
  @Column({ length: 100 })
  doc: string; 

  // 作品添加一个审核字段， 是否审核通过， 用于审核发布的产品
  @ApiProperty({ description: '是否审核通过', default: false })
  @Column({ default: false })
  isAudit: boolean;
  
  @ApiProperty({ description: '提示词内容' })
  @Column({ type: 'text' })
  prompt: string;

  @ApiProperty({ description: '图片URL数组', type: [String] }) 
  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @ApiProperty({ description: '图片URL数组Prompts', type: [String] }) 
  @Column({ type: 'simple-array', nullable: true })
  imagePrompts: string[];

  @ApiProperty({ description: '视频URL数组', type: [String] }) 
  @Column({ type: 'simple-array', nullable: true })
  videos: string[];

  @ApiProperty({ description: '音频URL数组', type: [String] }) 
  @Column({ type: 'simple-array', nullable: true })
  audios: string[];

  // status 状态 0 草稿  1 发布  2  私密（默认图片修复和换脸为私密发布的), 可以为空
  @ApiProperty({ description: '作品状态',  })
  @Column({ nullable: true })  
  status: number;

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