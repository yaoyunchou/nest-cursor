/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:30:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:30:44
 * @FilePath: \nest-cursor\src\modules\user\entities\user.entity.ts
 * @Description: 用户实体
 */
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../role/entities/role.entity';


@Entity('user')
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户名' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: '性别'})
  @Column({ nullable: true })
  gender: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ nullable: true })
  email: string;

  @ApiProperty({ description: '密码' })
  @Column({ select: false })
  password: string;

  @ApiProperty({ description: '头像' })
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty({ description: '状态', enum: [0, 1], default: 1 })
  @Column({ default: 1 })
  status: number;

  @ApiProperty({ description: '备注' })
  @Column({ nullable: true })
  remark: string;

  @ApiProperty({ description: '地址' })
  @Column('json', { nullable: true })
  address: number[];

  @ApiProperty({ description: '地址文本' })
  @Column({ nullable: true })
  addressText: string;

  @ApiProperty({ description: '生日' })
  @Column({ nullable: true })
  birth: string;


  
  @ApiProperty({ description: '手机' })
  @Column({ nullable: true })
  phone: string;
   
  @ApiProperty({ description: '微信openid' })
  @Column({ nullable: true, unique: true })
  openid?: string;

  @ApiProperty({ description: '用户角色', type: () => Role })
  @ManyToMany(() => Role, { cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
} 