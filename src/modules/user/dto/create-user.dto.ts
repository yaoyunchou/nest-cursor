/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:30:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:30:44
 * @FilePath: \nest-cursor\src\modules\user\dto\create-user.dto.ts
 * @Description: 创建用户DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, IsArray, IsNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @MinLength(2)
  username: string;

  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '头像', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: '状态', default: 1 })
  @IsNumber()
  @IsOptional()
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ description: '角色ID列表', type: [Number] })
  @IsArray()
  @IsOptional()
  roleIds?: number[];
} 