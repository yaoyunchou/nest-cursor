/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 14:43:35
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-14 15:15:51
 * @FilePath: \nest-cursor\src\article\article.entity.ts
 * @Description: 文章实体类
 */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Article {
  @ApiProperty({ description: '文章ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '文章标题' })
  @Column()
  title: string;

  @ApiProperty({ description: '文章内容' })
  @Column('text')
  content: string;

  @ApiProperty({ description: '作者' })
  @Column()
  author: string;

  @ApiProperty({ description: '创建时间' })
  @Column()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @Column()
  updatedAt: Date;
} 