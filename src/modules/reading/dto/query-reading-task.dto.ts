import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 查询读书任务DTO
 */
export class QueryReadingTaskDto {
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

  @ApiProperty({
    description: '任务状态',
    required: false,
    enum: ['pending', 'in_progress', 'completed'],
  })
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed'])
  status?: string;
}

