import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateIf } from 'class-validator';

/**
 * 图片内容DTO
 */
export class ImageContentDto {
  @ApiProperty({ description: '图片URL', example: 'https://example.com/image.jpg' })
  @IsString()
  @IsNotEmpty()
  url: string;
}

/**
 * 消息内容DTO（支持文本和图片）
 */
export class MessageContentDto {
  @ApiProperty({ description: '内容类型', example: 'text', enum: ['text', 'image_url'] })
  @IsString()
  type: 'text' | 'image_url';

  @ApiProperty({ description: '文本内容', example: '这是哪里？', required: false })
  @IsString()
  @ValidateIf((o) => o.type === 'text')
  @IsNotEmpty()
  text?: string;

  @ApiProperty({ description: '图片URL对象', required: false })
  @ValidateIf((o) => o.type === 'image_url')
  @IsNotEmpty()
  image_url?: ImageContentDto;
}

/**
 * AI聊天DTO
 */
export class ChatDto {
  @ApiProperty({ 
    description: '用户消息内容（文本或数组格式，支持图片）', 
    example: '你好，请介绍一下自己',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { $ref: '#/components/schemas/MessageContentDto' } }
    ]
  })
  @IsNotEmpty({ message: '消息内容不能为空' })
  message: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;

  @ApiProperty({ description: '对话历史记录', example: [], required: false })
  @IsArray()
  @IsOptional()
  history?: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>;

  @ApiProperty({ description: '系统提示词', example: '你是一个友好的AI助手', required: false })
  @IsString()
  @IsOptional()
  systemPrompt?: string;
}
