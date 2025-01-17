/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:40:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:40:44
 * @FilePath: \nest-cursor\src\modules\user\dto\query-user.dto.ts
 * @Description: 查询用户DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum UserOrderBy {
  ID = 'id',
  USERNAME = 'username',
  CREATED_AT = 'createdAt',
}

export class QueryUserDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: '状态', required: false, enum: [0, 1] })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  status?: number;

  @ApiProperty({ description: '页码', default: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageIndex?: number;

  @ApiProperty({ description: '每页数量', default: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageSize?: number;

  @ApiProperty({ description: '排序字段', enum: UserOrderBy, required: false })
  @IsOptional()
  @IsEnum(UserOrderBy)
  orderBy?: UserOrderBy;

  @ApiProperty({ description: '排序方式', enum: ['ASC', 'DESC'], required: false })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
} 