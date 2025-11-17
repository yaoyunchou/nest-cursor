import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

/**
 * 根据提示词生成内容DTO
 */
export class GenerateDto {
  @ApiProperty({ description: '提示词/指令', example: '写一篇关于人工智能发展的文章' })
  @IsString()
  @IsNotEmpty({ message: '提示词不能为空' })
  prompt: string;

  @ApiProperty({ description: '生成内容的长度（字数）', example: 1000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(100)
  @Max(5000)
  length?: number;

  @ApiProperty({ description: '内容类型，如：文章、故事、诗歌、报告', example: '文章', required: false })
  @IsString()
  @IsOptional()
  contentType?: string;

  @ApiProperty({ description: '主题或关键词', example: '人工智能、科技发展', required: false })
  @IsString()
  @IsOptional()
  keywords?: string;
}
