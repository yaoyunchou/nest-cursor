import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

/**
 * 总结内容DTO
 */
export class SummarizeDto {
  @ApiProperty({ description: '需要总结的内容', example: '这是一段很长的文章内容...' })
  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiProperty({ description: '总结长度（字数），默认200', example: 200, required: false })
  @IsNumber()
  @IsOptional()
  @Min(50)
  @Max(2000)
  length?: number;

  @ApiProperty({ description: '总结风格，如：简洁、详细、要点式', example: '简洁', required: false })
  @IsString()
  @IsOptional()
  style?: string;
}
