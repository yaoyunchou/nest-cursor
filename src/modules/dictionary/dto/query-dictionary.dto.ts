import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 查询字典DTO
 */
export class QueryDictionaryDto {
  @ApiProperty({ description: '字典分类', example: 'system', required: false })
  @IsOptional()
  @IsString({ message: '字典分类必须是字符串' })
  category?: string;

  @ApiProperty({ description: '字典名称', example: 'status', required: false })
  @IsOptional()
  @IsString({ message: '字典名称必须是字符串' })
  name?: string;

  @ApiProperty({ description: '当前页码', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  page?: number;

  @ApiProperty({ description: '每页条数', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页条数必须是数字' })
  pageSize?: number;
} 