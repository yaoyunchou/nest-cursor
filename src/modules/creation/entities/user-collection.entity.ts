/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\entities\user-collection.entity.ts
 * @Description: 用户收藏实体
 */
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  ManyToMany
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Creation } from './creation.entity';

@Entity('user_collections')
@Unique(['user.id', 'creation.id']) // 防止重复收藏
export class UserCollection {
  @ApiProperty({ description: '收藏记录ID' })
  @PrimaryGeneratedColumn()
  id: number;


  @ApiProperty({ description: '收藏用户信息', type: () => User })
  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: '被收藏的作品信息', type: () => Creation })
  @ManyToOne(() => Creation, { cascade: true })
  @JoinColumn({ name: 'creationId' })
  creation: Creation;

  @ApiProperty({ description: '收藏时间' })
  @CreateDateColumn()
  createdAt: Date;
} 