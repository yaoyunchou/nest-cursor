import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Page } from './page.entity';
import { Check } from 'typeorm';



@Entity('lowcode_page_versions')
export class PageVersion {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '版本ID' })
  id: number;

  @Column()
  @ApiProperty({ description: '页面ID' })
  pageId: number;

  @ManyToOne(() => Page, page => page.versions)
  @JoinColumn({ name: 'pageId' })
  page: Page;

  @Column({ type: 'text' })
  @ApiProperty({ description: '页面JSON数据' })
  content: string;

  @Column({ type: 'varchar', length: 20 })
  @ApiProperty({ 
    description: '版本号（遵循语义化版本格式，如：1.0.0）',
    example: '1.0.0'
  })
  @Check(`"version" ~ '^\\d+\\.\\d+\\.\\d+$'`)
  version: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '发布说明' })
  remark: string;

  @Column({ default: false })
  @ApiProperty({ description: '是否删除' })
  isDeleted: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
} 