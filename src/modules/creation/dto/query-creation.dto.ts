/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\dto\query-creation.dto.ts
 * @Description: 查询作品DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '@/modules/user/entities/user.entity';

export enum SortField {
  CREATED_AT = 'createdAt',
  LIKES = 'likes',
  FAVORITES = 'favorites',
  COLLECTIONS = 'collections'
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class QueryCreationDto {
  @ApiProperty({ description: '作品标题关键词', required: false, example: 'AI作品' })
  @IsOptional()
  @IsString({ message: '标题关键词必须是字符串' })
  title?: string;

  @ApiProperty({ description: '提示词关键词', required: false, example: '小猫' })
  @IsOptional()
  @IsString({ message: '提示词关键词必须是字符串' })
  prompt?: string;

  @ApiProperty({ description: '是否公开', required: false, example: true })
  @IsOptional()
  @IsBoolean({ message: '公开状态必须是布尔值' })
  status?: number;

  @ApiProperty({ description: '创建人ID', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '创建人ID必须是数字' })
  user?: User;



  @ApiProperty({ 
    description: '排序顺序', 
    enum: SortOrder, 
    required: false, 
    default: SortOrder.DESC,
    example: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: '排序顺序必须是有效值' })
  sortOrder?: SortOrder = SortOrder.DESC;

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
  pageSize?: number = 10;
} 