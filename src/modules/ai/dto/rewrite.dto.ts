import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

/**
 * 改写风格枚举
 */
export enum RewriteStyle {
  FORMAL = 'formal', // 正式
  CASUAL = 'casual', // 随意
  PROFESSIONAL = 'professional', // 专业
  SIMPLE = 'simple', // 简洁
  ELABORATE = 'elaborate', // 详细
}

/**
 * 改写内容DTO
 */
export class RewriteDto {
  @ApiProperty({ description: '需要改写的内容', example: '这个产品很好用' })
  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiProperty({ 
    description: '改写风格', 
    example: RewriteStyle.PROFESSIONAL,
    enum: RewriteStyle,
    required: false 
  })
  @IsEnum(RewriteStyle)
  @IsOptional()
  style?: RewriteStyle;

  @ApiProperty({ description: '其他要求，如：使用更正式的词汇、增加专业术语', example: '使用更正式的词汇', required: false })
  @IsString()
  @IsOptional()
  requirements?: string;
}
