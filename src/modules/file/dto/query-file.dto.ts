/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\file\dto\query-file.dto.ts
 * @Description: 查询文件DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryFileDto {
  @ApiProperty({ description: '文件名', required: false })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiProperty({ description: '文件类型', required: false })
  @IsOptional()
  @IsString()
  mimetype?: string;

 

  @ApiProperty({ description: '每页数量', default: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageSize?: number;
} 