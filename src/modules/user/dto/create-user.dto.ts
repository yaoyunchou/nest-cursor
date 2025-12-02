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
import { IsNumberArray } from '../validators/is-number-array.validator';

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

  @ApiProperty({ description: '地址', required: false, type: [Number] })
  @IsOptional()
  @IsNumberArray({ message: '地址必须是数字数组，不能是字符串' })
  address?: number[];

  
  @ApiProperty({ description: '地址文本', required: false })
  @IsString()
  @IsOptional()
  addressText?: string;

  // gender
  @ApiProperty({ description: '性别', required: false })
  @IsString()
  @IsOptional()
  gender?: string;


  @ApiProperty({ description: '生日', required: false })
  @IsString()
  @IsOptional()
  birth?: string;

  @ApiProperty({ description: '状态', default: 1 })
  @IsNumber()
  @IsOptional()
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string;

  // phone 手机 非必选
  @ApiProperty({ description: '手机', required: false })
  @IsString()
  @IsOptional()
  phone?: string;


  @ApiProperty({ description: '微信openid', required: false })
  @IsString()
  @IsOptional()
  openid?: string;

  @ApiProperty({ description: '角色ID列表', type: [Number] })
  @IsArray()
  @IsOptional()
  roleIds?: number[];
} 