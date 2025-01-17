/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 14:43:29
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-14 15:00:39
 * @FilePath: \nest-cursor\src\user\user.entity.ts
 * @Description: 用户实体类
 */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../role/role.entity';

@Entity()
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户名' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: '密码' })
  @Column()
  password: string;

  @ApiProperty({ description: '用户角色', enum: Role, isArray: true })
  @Column('simple-array')
  roles: Role[];
} 