import { IsOptional, IsUrl, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 更新打卡记录DTO
 */
export class UpdateReadingCheckinDto {
  @ApiProperty({ description: '录音文件URL', required: false, example: 'https://example.com/audio/new_xxx.mp3' })
  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @ApiProperty({ description: '录音时长（秒）', required: false, example: 150 })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

