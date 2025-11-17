import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Menu } from '../../navigation/entities/menu.entity';
import { Permission } from '../../navigation/entities/permission.entity';

export enum RoleCode {
  ADMIN = 'admin',          // 管理员
  USER = 'user',           // 普通用户
  TESTER = 'tester',       // 测试用户
  OPERATOR = 'operator'    // 运营用户
}

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '角色ID' })
  id: number;
  // unique: true 表示该字段在数据库中必须是唯一的,不能重复
  // 例如角色编码code字段设置了unique: true,就不能有两个角色使用相同的code

  @Column({ unique: true, nullable: false })
  @ApiProperty({ description: '角色编码' })
  code: RoleCode;

  @Column()
  @ApiProperty({ description: '角色名称' })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '角色描述' })
  description: string;

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @ManyToMany(() => Menu, menu => menu.roles)
  menus: Menu[];

  @ManyToMany(() => Permission, permission => permission.roles)
  permissions: Permission[];

  @CreateDateColumn()
  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
} 