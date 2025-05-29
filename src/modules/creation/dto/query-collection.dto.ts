/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\dto\query-collection.dto.ts
 * @Description: 查询收藏DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '@/modules/user/entities/user.entity';

export class QueryCollectionDto {
  @ApiProperty({ description: '用户ID', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '用户ID必须是数字' })
  user?: User;

  @ApiProperty({ description: '页码', required: false, default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码必须大于0' })
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量必须大于0' })
  @Max(100, { message: '每页数量不能超过100' })
  limit?: number = 10;
} 