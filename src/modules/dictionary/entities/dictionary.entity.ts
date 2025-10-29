import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 字典实体
 */
@Entity('dictionary')
export class Dictionary {
  @PrimaryGeneratedColumn()
  id: number;

  /** 字典分类 */
  @Column({ type: 'varchar', length: 100, comment: '字典分类' })
  category: string;

  /** 字典名称 */
  @Column({ type: 'varchar', length: 100, comment: '字典名称' })
  name: string;

  /** 字典值 */
  @Column({ type: 'text', comment: '字典值' })
  value: string;

  /** 排序权重 */
  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sort: number;

  /** 是否启用 */
  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isEnabled: boolean;

  /** 备注 */
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '备注' })
  remark: string;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
} 