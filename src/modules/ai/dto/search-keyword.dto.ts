import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * 关键词搜索DTO
 */
export class SearchKeywordDto {
  @ApiProperty({ description: '搜索关键词', example: '学习' })
  @IsString()
  @IsNotEmpty({ message: '关键词不能为空' })
  keyword: string;

  @ApiProperty({ description: '搜索类型，可选值：all, user, target, task, creation', example: 'all', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsOptional()
  pageIndex?: number;

  @ApiProperty({ description: '每页数量', example: 10, required: false })
  @IsOptional()
  pageSize?: number;
}
