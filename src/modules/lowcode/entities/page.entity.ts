import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeUpdate } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PageVersion } from './page-version.entity';

export enum PageStatus {
  DRAFT = 'draft',      // 草稿
  PUBLISHED = 'published', // 已发布
  OFFLINE = 'offline'   // 已下线
}

@Entity('lowcode_pages')
export class Page {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '页面ID' })
  id: number;

  @Column()
  @ApiProperty({ description: '页面标题' })
  title: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: '当前页面JSON数据' })
  content: string;

  @Column({ type: 'enum', enum: PageStatus, default: PageStatus.DRAFT })
  @ApiProperty({ description: '页面状态', enum: PageStatus })
  status: PageStatus;

  @Column({ default: '1.0.0' })
  @ApiProperty({ description: '版本号' })
  version: string;

  @Column({ default: true })
  @ApiProperty({ description: '是否启用' })
  isEnabled: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;



} 