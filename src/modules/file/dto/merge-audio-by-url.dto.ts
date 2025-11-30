import { IsArray, ArrayMinSize, ArrayMaxSize, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 通过URL合并音频文件DTO
 */
export class MergeAudioByUrlDto {
  @ApiProperty({
    description: '七牛云音频文件URL数组（2-21个）',
    example: [
      'https://your-domain.com/coze/audio1.mp3',
      'https://your-domain.com/coze/audio2.mp3',
    ],
    type: [String],
  })
  @IsArray({ message: 'urls必须是数组' })
  @ArrayMinSize(2, { message: '至少需要2个音频文件URL' })
  @ArrayMaxSize(21, { message: '最多只能合并21个音频文件' })
  @IsUrl({}, { each: true, message: 'urls数组中的每个元素必须是有效的URL' })
  urls: string[];
}

