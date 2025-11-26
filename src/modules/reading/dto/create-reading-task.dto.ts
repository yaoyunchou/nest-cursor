import { IsString, IsDateString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建读书任务DTO
 */
export class CreateReadingTaskDto {
  @ApiProperty({ description: '任务名称', example: '英语读书打卡' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '开始日期', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: '结束日期', example: '2024-12-31' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

