/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\file\entities\file.entity.ts
 * @Description: 文件实体
 */
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

@Entity('file')
export class File {
  @ApiProperty({ description: '文件ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '文件名称' })
  @Column()
  filename: string;

  @ApiProperty({ description: '文件原始名称' })
  @Column()
  originalname: string;

  @ApiProperty({ description: '文件大小' })
  @Column()
  size: number;

  @ApiProperty({ description: '文件类型' })
  @Column()
  mimetype: string;

  @ApiProperty({ description: '文件URL' })
  @Column()
  url: string;

  @ApiProperty({ description: '文件Key' })
  @Column()
  key: string;

  @ApiProperty({ description: '上传者ID' })
  @Column()
  userId: number;

  @ApiProperty({ description: '上传者', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
} 