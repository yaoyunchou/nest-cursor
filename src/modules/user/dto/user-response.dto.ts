import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../role/entities/role.entity';
import { Exclude, Transform } from 'class-transformer';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ description: '用户ID' })
  id: number;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '邮箱' })
  email: string;

  @ApiProperty({ description: '状态', enum: [0, 1], default: 1 })
  status: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '角色列表' })
  roles: any[];

  @Exclude()
  password: string;

  @ApiProperty({ description: '头像' })
  avatar: string;

  @ApiProperty({ description: '备注' })
  remark: string;

  @ApiProperty({ description: '手机' })
  phone: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
    
    delete this.password;
    
    if (partial.roles) {
      this.roles = partial.roles.map(role => ({
        id: role.id,
        name: role.name,
        code: role.code
      }));
    }
  }
} 