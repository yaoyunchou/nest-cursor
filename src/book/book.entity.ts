/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 14:43:29
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-14 15:00:39
 * @FilePath: \nest-cursor\src\book\book.entity.ts
 * @Description: 图书实体类
 */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Book {
  @ApiProperty({ description: '图书ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '图书标题' })
  @Column()
  title: string;

  @ApiProperty({ description: '作者' })
  @Column()
  author: string;

  @ApiProperty({ description: '图书描述' })
  @Column('text')
  description: string;

  @ApiProperty({ description: '封面图片URL' })
  @Column()
  coverImage: string;

  @ApiProperty({ description: '创建时间' })
  @Column()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @Column()
  updatedAt: Date;
} 