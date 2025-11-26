import { IsDateString, IsNotEmpty, IsOptional, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 创建打卡记录DTO
 */
export class CreateReadingCheckinDto {
  @ApiProperty({ description: '任务ID', example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  taskId: number;

  @ApiProperty({ description: '打卡日期', example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  checkInDate: string;

  @ApiProperty({ description: '录音文件URL', required: false, example: 'https://example.com/audio/xxx.mp3' })
  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @ApiProperty({ description: '录音时长（秒）', required: false, example: 120 })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

