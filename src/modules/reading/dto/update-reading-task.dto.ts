import { IsString, IsDateString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 更新读书任务DTO
 */
export class UpdateReadingTaskDto {
  @ApiProperty({ description: '任务名称', required: false, example: '英语读书打卡（更新）' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiProperty({ description: '开始日期', required: false, example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: '结束日期', required: false, example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

