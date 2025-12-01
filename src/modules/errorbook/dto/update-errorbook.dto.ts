import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsUrl } from 'class-validator';

/**
 * 更新错题本DTO
 */
export class UpdateErrorBookDto {
  @ApiProperty({ description: '拍照图片URL列表（多张）', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiProperty({ description: '科目', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '年级', required: false })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ description: '单元', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'AI分析结果', required: false })
  @IsOptional()
  @IsString()
  aiAnalysis?: string;
}

