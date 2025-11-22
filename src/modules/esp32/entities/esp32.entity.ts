/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 20:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 20:00:00
 * @FilePath: \nest-cursor\src\modules\esp32\entities\esp32.entity.ts
 * @Description: ESP32芯片实体
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('esp32')
export class Esp32 {
  @ApiProperty({ description: '芯片ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '绑定ID' })
  @Column({ unique: true })
  bindingId: string;

  @ApiProperty({ description: '芯片型号' })
  @Column({ nullable: true })
  chipModel: string;

  @ApiProperty({ description: '备注' })
  @Column({ nullable: true, type: 'text' })
  remark: string;

  @ApiProperty({ description: '功能' })
  @Column({ nullable: true })
  function: string;

  @ApiProperty({ description: '订单来源' })
  @Column({ nullable: true })
  orderSource: string;

  @ApiProperty({ description: '订单ID' })
  @Column({ nullable: true })
  orderId: string;

  @ApiProperty({ description: '任务ID' })
  @Column({ nullable: true })
  taskId: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}

