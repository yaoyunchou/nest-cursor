import { ApiProperty } from '@nestjs/swagger';

/**
 * 上传并合并音频文件DTO
 */
export class UploadAudioMergeDto {
  @ApiProperty({
    description: '音频文件（1-21个，支持mp3、wav、m4a、aac格式）。单个文件直接上传返回，多个文件自动合并',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  files: Express.Multer.File[];
}

