import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CheckInType } from '../dto/check-in.dto';

/**
 * 用户打卡记录实体
 */
@Entity('user_action')
export class UserActionEntity {
  /** 记录ID
   *  id 自增
   */
  @ApiProperty({ description: '记录ID' })
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: '记录ID',
    unsigned: true,
  }) 
  id: number;

  /** 用户ID */
  @ApiProperty({ description: '用户ID' })
  @Column()
  userId: string;

  /** 打卡类型（morning/early, evening/late） */
  @ApiProperty({ description: '打卡类型', enum: CheckInType })
  @Column({ type: 'enum', enum: CheckInType })
  type: CheckInType;

  /** 打卡时间（ISO8601字符串） */
  @ApiProperty({ description: '打卡时间' })
  @Column()
  checkInTime: Date;

  /** 打卡日期（YYYY-MM-DD） */
  @ApiProperty({ description: '打卡日期' })
  @Column()
  date: string;

  /** 创建时间 */
  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  /** 连续打卡次数 */
  @ApiProperty({ description: '连续打卡次数', default: 1 })
  @Column()
  continuousCheckInCount: number;

  /** 更新时间 */
  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
} 