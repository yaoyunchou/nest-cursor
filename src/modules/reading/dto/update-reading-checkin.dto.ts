import { IsOptional, IsUrl, IsNumber, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 更新打卡记录DTO
 */
export class UpdateReadingCheckinDto {
  @ApiProperty({ description: '录音文件URL', required: false, example: 'https://example.com/audio/new_xxx.mp3' })
  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @ApiProperty({
    description: '录音文件URL列表（多段原始数据）',
    required: false,
    example: ['https://example.com/audio/xxx1.mp3', 'https://example.com/audio/xxx2.mp3'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: '录音文件URL列表至少包含一个URL' })
  @IsUrl({}, { each: true, message: '录音文件URL列表中的每个元素必须是有效的URL' })
  audioUrlList?: string[];

  @ApiProperty({ description: '录音时长（秒）', required: false, example: 150 })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

