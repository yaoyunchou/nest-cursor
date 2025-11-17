import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 图片资源表实体
 */
@Entity('file_resource')
export class FileResource {
  /** 主键，自增ID */
  @PrimaryGeneratedColumn()
  id: number;

  /** 图片资源URL */
  @Column({ type: 'varchar', length: 500 })
  url: string;

  /** 图片来源（如creation/manual） */
  @Column({ type: 'varchar', length: 50 })
  origin: string;

  /** 图片类型/分类 */
  @Column({ type: 'varchar', length: 50, nullable: true })
  type?: string;

  /** 标签，多个以逗号分隔 */
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  /** 适用场景，多个以逗号分隔 */
  @Column({ type: 'simple-array', nullable: true })
  scene?: string[];

  /** 权重，0-100，默认0 */
  @Column({ type: 'int', default: 0 })
  weight: number;

  /** 被使用次数，默认0 */
  @Column({ type: 'int', default: 0 })
  usageCount: number;

  /** 图片描述 */
  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  /** 来源ID（可用于溯源） */
  @Column({ type: 'varchar', length: 100, nullable: true })
  originId?: string;

  /** 创建时间 */
  @CreateDateColumn()
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn()
  updatedAt: Date;
} 