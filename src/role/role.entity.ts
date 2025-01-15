import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Role {
  @ApiProperty({ description: '角色ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '角色名称' })
  @Column({ unique: true })
  name: string;
} 