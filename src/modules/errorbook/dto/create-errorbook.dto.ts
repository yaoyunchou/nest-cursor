import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsUrl, ArrayMinSize } from 'class-validator';

/**
 * 创建错题本DTO
 */
export class CreateErrorBookDto {
  @ApiProperty({ description: '拍照图片URL列表（多张）', type: [String], required: true })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: '至少需要上传一张图片' })
  @IsUrl({}, { each: true })
  images: string[];

  @ApiProperty({ description: '科目', required: false, example: '数学' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '年级', required: false, example: '一年级' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ description: '单元', required: false, example: '第一单元' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'AI分析结果', required: false })
  @IsOptional()
  @IsString()
  aiAnalysis?: string;
}

