import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../role/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '权限ID' })
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: '权限编码' })
  code: string;

  @Column()
  @ApiProperty({ description: '权限名称' })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '权限描述' })
  description: string;

  @Column()
  @ApiProperty({ description: '资源类型' })
  resourceType: string;

  @Column()
  @ApiProperty({ description: '操作类型' })
  action: string;

  @ManyToMany(() => Role, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'permission_id', referencedColumnName: 'id' },
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