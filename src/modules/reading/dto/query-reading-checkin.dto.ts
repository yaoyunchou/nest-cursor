import { IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 查询打卡记录DTO
 */
export class QueryReadingCheckinDto {
  @ApiProperty({ description: '任务ID', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  taskId?: number;

  @ApiProperty({ description: '年份', required: false, example: 2024 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @ApiProperty({ description: '月份', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  month?: number;

  @ApiProperty({ description: '页码', required: false, example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;
}

