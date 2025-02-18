import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('lowcode_page_caches')
@Index(['pageId', 'createdAt'])
export class PageCache {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '缓存ID' })
  id: number;

  @Column()
  @ApiProperty({ description: '页面ID' })
  @Index()
  pageId: number;

  @Column({ type: 'text' })
  @ApiProperty({ description: '页面JSON数据' })
  content: string;

  @CreateDateColumn()
  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
} 