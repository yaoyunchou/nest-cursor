import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

/**
 * 扩写内容DTO
 */
export class ExpandDto {
  @ApiProperty({ description: '需要扩写的内容', example: '今天天气很好' })
  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiProperty({ description: '扩写后的目标长度（字数）', example: 500, required: false })
  @IsNumber()
  @IsOptional()
  @Min(100)
  @Max(5000)
  targetLength?: number;

  @ApiProperty({ description: '扩写方向，如：详细描述、举例说明、添加背景', example: '详细描述', required: false })
  @IsString()
  @IsOptional()
  direction?: string;
}
