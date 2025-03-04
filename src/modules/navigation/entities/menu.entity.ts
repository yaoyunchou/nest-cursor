import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, Tree, TreeChildren, TreeParent, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../role/entities/role.entity';

@Entity('navigation_menus')
@Tree("closure-table")
export class Menu {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '菜单ID' })
  id: number;

  @Column()
  @ApiProperty({ description: '菜单名称' })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '菜单图标' })
  icon: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '路由路径' })
  path: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '组件路径' })
  component: string;

  @Column({ default: 1 })
  @ApiProperty({ description: '排序' })
  sort: number;

  @Column({ default: true })
  @ApiProperty({ description: '是否显示' })
  isVisible: boolean;

  @TreeChildren()
  children: Menu[];

  @TreeParent()
  parent: Menu;

  @ManyToMany(() => Role, { cascade: true })
  @JoinTable({
    name: 'role_menus',
    joinColumn: { name: 'menu_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn()
  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
} 